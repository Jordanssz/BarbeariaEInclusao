import { Component, OnInit } from '@angular/core';
import { AgendamentoService } from 'src/app/services/agendamento';
import { BarbeariaService } from 'src/app/services/barbearia';
import { ProfissionalService } from 'src/app/services/profissional';
import { ServicoService } from 'src/app/services/servico';
import { UsuarioService } from 'src/app/services/usuario';
import { Agendamento } from 'src/app/model/agendamento';
import { AlertController, ToastController } from '@ionic/angular';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

// Interface estendida para exibição
interface AgendamentoDisplay extends Agendamento {
  nomeCliente: string;
  nomeServico: string;
  nomeBarbeiro?: string;
}

@Component({
  selector: 'app-agenda-barbearia',
  templateUrl: './agenda-barbearia.page.html',
  styleUrls: ['./agenda-barbearia.page.scss'],
  standalone: false
})
export class AgendaBarbeariaPage implements OnInit {

  agendamentos: AgendamentoDisplay[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  idBarbeariaLogada: number | null = null;
  // Calendário
  currentMonth!: number; // 0-11
  currentYear!: number;
  calendarWeeks: Array<Array<{ dateISO: string; dayNumber: number; inMonth: boolean; appointments: AgendamentoDisplay[] }>> = [];
  selectedDateISO: string | null = null;

  // Mock de nomes de clientes (substituir futuramente por API real)
  private mockNomesClientes: { [key: number]: string } = {
    1: 'João Silva',
    2: 'Maria Santos',
    3: 'Pedro Oliveira',
    4: 'Ana Costa',
    5: 'Carlos Mendes'
  };

  constructor(
    private agendamentoService: AgendamentoService,
    private barbeariaService: BarbeariaService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.carregarAgendamentos();
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

  // 🔄 Carrega todos os agendamentos da barbearia logada
  carregarAgendamentos() {
    this.isLoading = true;
    this.errorMessage = null;

    // Obtém a barbearia logada do localStorage
    const barbeariaLocal = this.barbeariaService.carregar();
    this.idBarbeariaLogada = barbeariaLocal?.idBarbearia || null;

    if (!this.idBarbeariaLogada) {
      this.errorMessage = "ID da barbearia não encontrado. Por favor, faça login.";
      this.isLoading = false;
      return;
    }

    // Primeiro: obter todos os barbeiros cadastrados na barbearia logada
    this.profissionalService.getBarbeirosByBarbearia(this.idBarbeariaLogada).pipe(
      switchMap((barbeiros: any[]) => {
        const idsBarbeiros = (barbeiros || []).map(b => Number((b as any).idBarbeiro ?? (b as any).id ?? -1));

        // Busca todos os agendamentos e filtra pelos barbeiros da barbearia
        return this.agendamentoService.getAll().pipe(
          map((agendamentos: Agendamento[]) => (agendamentos || []).filter(a => idsBarbeiros.includes(Number(a.idBarbeiroAtendimento)))) ,
          switchMap((meusAgendamentos: Agendamento[]) => {
            if (!meusAgendamentos || meusAgendamentos.length === 0) return of([]);

            // Enriquecer cada agendamento com serviço e cliente
            const chamadas = meusAgendamentos.map(ag =>
              forkJoin({
  servico: this.servicoService.buscarPorId(ag.idServicoAtendimento)
    .pipe(catchError(() => of(null))),

  cliente: this.usuarioService.findById(ag.idUsuarioAtendimento)
    .pipe(catchError(() => of(null))),

  barbeiro: this.profissionalService.getBarbeiroById(ag.idBarbeiroAtendimento)
    .pipe(catchError(() => of(null)))
})
.pipe(
                map(({ servico, cliente, barbeiro }) => ({
  ...ag,
  nomeCliente:
    cliente?.nomeUsuario ||
    this.mockNomesClientes[ag.idUsuarioAtendimento] ||
    `Cliente ID ${ag.idUsuarioAtendimento}`,

  nomeServico:
    servico?.nomeServico ||
    `Serviço ID ${ag.idServicoAtendimento}`,

  nomeBarbeiro:
    barbeiro?.nomeBarbeiro ||
    `Barbeiro ID ${ag.idBarbeiroAtendimento}`
}) as AgendamentoDisplay)
              )
            );

            return forkJoin(chamadas);
          })
        );
      }),
      catchError(error => {
        console.error('Erro ao carregar agendamentos:', error);
        this.errorMessage = "Erro ao carregar agendamentos. Tente novamente mais tarde.";
        this.isLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (agendamentosComNomes: AgendamentoDisplay[]) => {
        this.agendamentos = agendamentosComNomes;
        this.isLoading = false;

        if (agendamentosComNomes.length === 0 && !this.errorMessage) {
          this.errorMessage = "Você não possui agendamentos marcados.";
        }

        // Monta o calendário após carregar os agendamentos
        this.buildCalendar(this.currentYear, this.currentMonth);
      }
    });
  }

  private makeDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private buildCalendar(year: number, month: number) {
    const map: { [iso: string]: AgendamentoDisplay[] } = {};
    (this.agendamentos || []).forEach(a => {
      const key = a.dataAtendimento;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const startDate = new Date(year, month, 1 - startOffset);

    const weeks: Array<any> = [];
    let cur = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const days: any[] = [];
      for (let d = 0; d < 7; d++) {
        const dateISO = this.makeDateISO(cur);
        const inMonth = cur.getMonth() === month;
        days.push({ dateISO, dayNumber: cur.getDate(), inMonth, appointments: map[dateISO] || [] });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(days);
    }

    this.calendarWeeks = weeks;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else this.currentMonth -= 1;
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else this.currentMonth += 1;
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

  selectDay(dateISO: string) {
    this.selectedDateISO = dateISO === this.selectedDateISO ? null : dateISO;
  }

  getAppointmentsFor(dateISO: string | null) {
    if (!dateISO) return [] as AgendamentoDisplay[];
    return (this.agendamentos || []).filter(a => a.dataAtendimento === dateISO).sort((x, y) => (x.horaAtendimento || '').localeCompare(y.horaAtendimento || ''));
  }

  // ⚠️ Exibe o alerta de confirmação para cancelamento
  async confirmarCancelamento(agendamento: AgendamentoDisplay) {
    const alert = await this.alertController.create({
      header: 'Cancelar agendamento',
      message: `Deseja realmente cancelar o agendamento de <b>${agendamento.nomeCliente}</b> para <b>${agendamento.nomeServico}</b>?`,
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
        this.agendamentos = this.agendamentos.filter(a => a.idAtendimento !== agendamento.idAtendimento);

        const toast = await this.toastController.create({
          message: 'Agendamento cancelado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        // Se não houver mais agendamentos, exibe mensagem
        if (this.agendamentos.length === 0) {
          this.errorMessage = "Você não possui agendamentos marcados.";
        }
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
}
