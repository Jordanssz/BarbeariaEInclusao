import { Component, OnInit } from '@angular/core';
import { AgendamentoService } from 'src/app/services/agendamento';
import { Agendamento } from 'src/app/model/agendamento';
import { UsuarioService } from 'src/app/services/usuario';
import { ServicoService } from 'src/app/services/servico';
import { ProfissionalService } from 'src/app/services/profissional';
import { AvaliacaoService } from 'src/app/services/avaliacao';
import { AlertController, ToastController } from '@ionic/angular'; // ✅ Import necessário
import { Router } from '@angular/router';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

// Interface estendida para exibição
interface AgendamentoDisplay extends Agendamento {
  nomeBarbeiro: string;
  nomeServico: string;
  jaAvaliado?: boolean;
}

@Component({
  selector: 'app-atendimentos-marcados',
  templateUrl: './atendimentos-marcados.page.html',
  styleUrls: ['./atendimentos-marcados.page.scss'],
  standalone: false
})
export class AtendimentosMarcadosPage implements OnInit {

  atendimentos: AgendamentoDisplay[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  idUsuarioLogado: number | null = null;

  // Mock de nomes de barbeiro (substituir futuramente por API real)
  private mockNomesBarbeiro: { [key: number]: string } = {
    1: 'João Barbeiro',
    2: 'Carlos Profissional',
    3: 'Pedro Especialista'
  };

  constructor(
    private agendamentoService: AgendamentoService,
    private usuarioService: UsuarioService,
    private servicoService: ServicoService,
    private profissionalService: ProfissionalService,
    private avaliacaoService: AvaliacaoService,
    private alertController: AlertController, // ✅ Injetado
    private toastController: ToastController  // ✅ Injetado
    , private router: Router
  ) {}

  ngOnInit() {
    this.carregarAtendimentos();
  }

  // Recarrega sempre que a página voltar ao foco (ex.: após avaliar)
  ionViewWillEnter() {
    this.carregarAtendimentos();
  }

  /**
   * Marca como 'REALIZADO' todos os agendamentos cuja data/hora já passaram.
   * Atualiza o servidor via AgendamentoService.update e, em caso de sucesso,
   * atualiza também a lista local para refletir o novo status.
   */
  private marcarConcluidosSePassado(atendimentos: AgendamentoDisplay[]) {
    const agora = new Date();
    const atualizacoes = [] as any[];

    atendimentos.forEach(a => {
      if (a.statusAtendimento !== 'AGENDADO') return;

      try {
        const [ano, mes, dia] = a.dataAtendimento.split('-').map(Number);
        const [horaStr, minStr, segStr] = (a.horaAtendimento || '00:00:00').split(':');
        const hora = Number(horaStr || '0');
        const min = Number(minStr || '0');
        const seg = Number(segStr || '0');

        const dataAgendamento = new Date(ano, (mes || 1) - 1, dia, hora, min, seg);

        if (dataAgendamento <= agora && a.idAtendimento) {
          const atualizado: any = {
            idAtendimento: a.idAtendimento,
            idUsuarioAtendimento: a.idUsuarioAtendimento,
            idBarbeiroAtendimento: a.idBarbeiroAtendimento,
            idServicoAtendimento: a.idServicoAtendimento,
            dataAtendimento: a.dataAtendimento,
            horaAtendimento: a.horaAtendimento,
            statusAtendimento: 'REALIZADO'
          };

          atualizacoes.push(
            this.agendamentoService.update(atualizado).pipe(
              // Em caso de erro, retornamos null para não interromper o forkJoin
              catchError(err => {
                console.error('Erro ao marcar agendamento como realizado:', err);
                return of(null);
              })
            )
          );
        }
      } catch (err) {
        console.error('Erro ao processar data/hora do agendamento:', err);
      }
    });

    if (atualizacoes.length === 0) return;

    forkJoin(atualizacoes).subscribe(results => {
      // Atualiza os itens locais para mostrar REALIZADO imediatamente
      results.forEach((res: any) => {
        if (res && res.idAtendimento) {
          const idx = this.atendimentos.findIndex(x => x.idAtendimento === res.idAtendimento);
          if (idx >= 0) {
            this.atendimentos[idx].statusAtendimento = res.statusAtendimento || 'REALIZADO';
          }
        }
      });
    });
  }

  // 🕓 Formata a data/hora para exibição amigável
  formatarDataHora(data: string, hora: string): string {
    try {
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
      const horaFormatada = hora.substring(0, 5);
      return `${dataFormatada} às ${horaFormatada}`;
    } catch {
      return `${data} ${hora}`;
    }
  }

  // 🔄 Carrega todos os atendimentos do usuário logado
  carregarAtendimentos() {
    this.isLoading = true;
    this.errorMessage = null;

    this.idUsuarioLogado = this.usuarioService.getIdUsuarioLogado() || 1;

    if (!this.idUsuarioLogado) {
      this.errorMessage = "ID do usuário não encontrado. Por favor, faça login.";
      this.isLoading = false;
      return;
    }

    this.agendamentoService.getAgendamentosByUserId(this.idUsuarioLogado).pipe(
      switchMap((agendamentos: Agendamento[]) => {
        if (agendamentos.length === 0) {
          return of([]);
        }

        // Para cada agendamento buscamos simultaneamente o serviço e o barbeiro
        const chamadasServico = agendamentos.map(ag =>
          forkJoin({
            servico: this.servicoService.buscarPorId(ag.idServicoAtendimento).pipe(catchError(() => of(null))),
            barbeiro: this.profissionalService.getBarbeiroById(ag.idBarbeiroAtendimento).pipe(catchError(() => of(null)))
          }).pipe(
            map(({ servico, barbeiro }) => ({
              ...ag,
              nomeBarbeiro: (barbeiro && (barbeiro as any).nomeBarbeiro) || this.mockNomesBarbeiro[ag.idBarbeiroAtendimento] || `Barbeiro ID ${ag.idBarbeiroAtendimento}`,
              nomeServico: (servico && (servico as any).nomeServico) || `Serviço ID ${ag.idServicoAtendimento} (erro ao carregar)`
            }) as AgendamentoDisplay)
          )
        );

        return forkJoin(chamadasServico);
      }),
      catchError(error => {
        console.error('Erro ao carregar agendamentos:', error);
        this.errorMessage = "Erro ao carregar seus agendamentos. Tente novamente mais tarde.";
        this.isLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (atendimentosComNomes: AgendamentoDisplay[]) => {
        this.atendimentos = atendimentosComNomes;
        this.isLoading = false;

        // Verifica e marca automaticamente agendamentos cuja data/hora já passaram
        this.marcarConcluidosSePassado(this.atendimentos);

        // Verifica se cada atendimento já possui avaliação para ocultar o botão
        const verificacoes = this.atendimentos.map(a => {
          if (!a.idAtendimento) return of([]);
          return this.avaliacaoService.getByAtendimento(a.idAtendimento!).pipe(catchError(() => of([])));
        });

        forkJoin(verificacoes).subscribe(results => {
          results.forEach((res: any, idx: number) => {
            (this.atendimentos[idx] as any).jaAvaliado = Array.isArray(res) && res.length > 0;
          });
        });

        if (atendimentosComNomes.length === 0 && !this.errorMessage) {
          this.errorMessage = "Você não possui agendamentos marcados.";
        }
      }
    });
  }

  // ⚠️ Exibe o alerta de confirmação
  async confirmarCancelamento(agendamento: AgendamentoDisplay) {
    const alert = await this.alertController.create({
      header: 'Cancelar agendamento',
      message: `Deseja realmente cancelar o serviço <b>${agendamento.nomeServico}</b> com ${agendamento.nomeBarbeiro}?`,
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, cancelar',
          handler: () => this.cancelarAgendamento(agendamento)
        }
      ]
    });

    await alert.present();
  }

  // ❌ Cancela (deleta) o agendamento
  cancelarAgendamento(agendamento: AgendamentoDisplay) {
    this.agendamentoService.delete(agendamento.idAtendimento!).subscribe({
      next: async () => {
        // Remove da lista local
        this.atendimentos = this.atendimentos.filter(a => a.idAtendimento !== agendamento.idAtendimento);

        const toast = await this.toastController.create({
          message: 'Agendamento cancelado e removido com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Erro ao excluir agendamento:', err);
        const toast = await this.toastController.create({
          message: 'Erro ao cancelar agendamento. Tente novamente.',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  // Navega para a página de avaliação, passando o id do atendimento como query param
  irAvaliar(agendamento: AgendamentoDisplay) {
    if (!agendamento.idAtendimento) return;
    this.router.navigate(['/avaliacao'], { queryParams: { id: agendamento.idAtendimento } });
  }

}
