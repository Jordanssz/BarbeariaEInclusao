import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AgendamentoService } from 'src/app/services/agendamento'; 
import { Agendamento } from 'src/app/model/agendamento';
import { UsuarioService } from 'src/app/services/usuario';
import { ServicoService } from 'src/app/services/servico';
import { Servico } from 'src/app/model/servico';
import { ProfissionalService } from 'src/app/services/profissional';
import { ActivatedRoute, Router } from '@angular/router'; 

@Component({
  selector: 'app-marcar-agendamento',
  templateUrl: './marcar-agendamento.page.html',
  styleUrls: ['./marcar-agendamento.page.scss'],
  standalone: false 
})
export class MarcarAgendamentoPage implements OnInit {

  // --- Propriedades de Entrada ---
  idServico: number | null = null; 
  private idBarbearia = 5; 
  
  // --- Dados Dinâmicos ---
  private idUsuarioLogado: number | null = null; 
  servicoSelecionado: Servico | null = null;
  profissionaisDisponiveis: { id: number; nome: string }[] = [];

  // Campos do formulário
  dataSelecionada?: string;
  horarioSelecionado?: string;
  profissionalSelecionado?: number | null;
  horariosDisponiveis: string[] = []; 
  allHorariosDisponiveis: string[] = [];
  horariosOcupadosSet: Set<string> = new Set();

  constructor(
    private alertController: AlertController,
    private agendamentoService: AgendamentoService,
    private usuarioService: UsuarioService,
    private servicoService: ServicoService,
    private profissionalService: ProfissionalService,
    private route: ActivatedRoute, 
    private router: Router 
  ) {}

  ngOnInit() {
    this.gerarHorariosDisponiveis();
    this.carregarIdServicoDaRota(); 
  }
  
  // 💡 CORREÇÃO APLICADA AQUI: Usando 'idServico' em vez de 'id'
  carregarIdServicoDaRota() {
    // Busca o parâmetro com o nome exato configurado no app-routing.module.ts
    const idParam = this.route.snapshot.paramMap.get('idServico');
    
    if (idParam) {
      this.idServico = Number(idParam);
    }
    
    // Verifica se a conversão foi bem-sucedida
    if (this.idServico && !isNaN(this.idServico) && this.idServico > 0) {
        console.log(`ID do Serviço capturado da rota: ${this.idServico}`);
        this.carregarDadosIniciais();
    } else {
        console.error('ID do Serviço não encontrado ou inválido na rota.');
        this.mostrarAviso('Erro de Rota', 'ID do serviço está faltando. Voltando à página inicial.', false);
        this.router.navigateByUrl('/inicio'); 
    }
  }


  // --- Lógica do Componente (Mantida) ---

  carregarDadosIniciais() {
    if (this.idServico === null) return; 
    
    this.idUsuarioLogado = this.usuarioService.getIdUsuarioLogado();
    
    if (!this.idUsuarioLogado) {
      this.mostrarAviso('Erro de Autenticação', 'Você precisa estar logado para agendar um serviço.', false);
      return;
    }
    
    this.servicoService.buscarPorId(this.idServico).subscribe({
        next: (servico) => {
            this.servicoSelecionado = servico;
            this.carregarProfissionais();
        },
        error: (error) => {
            console.error('Erro ao carregar serviço:', error);
            this.mostrarAviso('Erro de Serviço', 'Não foi possível carregar os detalhes do serviço.', false);
        }
    });
  }
  
  carregarProfissionais() {
    // Se tivermos o serviço carregado com o id da barbearia, busca os barbeiros reais
    const idBarbearia = this.servicoSelecionado?.idBarbeariaServico;
    if (!idBarbearia) {
      // fallback: mantém lista vazia
      this.profissionaisDisponiveis = [];
      return;
    }

    this.profissionalService.getBarbeirosByBarbearia(idBarbearia).subscribe({
      next: (barbeiros) => {
        const lista = barbeiros || [];
        this.profissionaisDisponiveis = lista.map((b: any) => {
          const id = b.idBarbeiro || b.id || 0;
          const nome = b.nomeBarbeiro || b.nomeProfissional || b.nome || b.apelido || 'Sem nome';
          return { id: id, nome: nome };
        });
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais da barbearia:', err);
        this.profissionaisDisponiveis = [];
      }
    });
  }

  gerarHorariosDisponiveis() {
    const horarios: string[] = [];
    this.adicionarIntervalos(horarios, 8, 11);
    this.adicionarIntervalos(horarios, 13, 18);
    this.allHorariosDisponiveis = horarios;
    this.horariosDisponiveis = [...this.allHorariosDisponiveis];
  }

  adicionarIntervalos(horarios: string[], horaInicio: number, horaFim: number) {
    for (let h = horaInicio; h < horaFim; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        horarios.push(hora);
      }
    }
  }
  
  private getBarbeiroId(valor: string | number | undefined | null): number {
    if (valor === undefined || valor === null) return 0;
    // Se já for número, retorna diretamente
    if (typeof valor === 'number') return valor;
    // Se for string, tenta encontrar pelo nome ou converter para número
    const asNumber = Number(valor);
    if (!isNaN(asNumber) && asNumber > 0) return asNumber;
    const profissional = this.profissionaisDisponiveis.find(p => p.nome === String(valor));
    return profissional?.id || 0;
  }

  // Chamado quando selecionam profissional
  onProfissionalChange() {
    this.horarioSelecionado = undefined;
    this.atualizarHorariosDisponiveisFiltrados();
  }

  // Chamado quando selecionam data
  onDataChange() {
    this.horarioSelecionado = undefined;
    this.atualizarHorariosDisponiveisFiltrados();
  }

  // Atualiza o conjunto de horários ocupados com base no profissional e na data selecionada
  atualizarHorariosDisponiveisFiltrados() {
    this.horariosOcupadosSet.clear();

    if (!this.profissionalSelecionado || !this.dataSelecionada) {
      return;
    }

    const dataISO = new Date(this.dataSelecionada as string).toISOString().split('T')[0];

    this.agendamentoService.getAll().subscribe({
      next: (agendamentos) => {
        const ocupados = (agendamentos || [])
          .filter(a => a.idBarbeiroAtendimento === this.profissionalSelecionado && a.dataAtendimento === dataISO && a.statusAtendimento !== 'CANCELADO')
          .map(a => (a.horaAtendimento || '').split(':').slice(0, 2).join(':'));

        ocupados.forEach(h => { if (h) this.horariosOcupadosSet.add(h); });
      },
      error: (err) => {
        console.error('Erro ao buscar agendamentos para bloquear horários:', err);
      }
    });
  }

  isHorarioOcupado(hora: string): boolean {
    return this.horariosOcupadosSet.has(hora);
  }

  async mostrarAviso(header: string, message: string, sucesso: boolean) {
    const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['OK'],
        cssClass: sucesso ? 'agendamento-success-alert' : 'agendamento-error-alert'
    });
    await alert.present();
  }
  
  async abrirConfirmacao() {
    if (!this.servicoSelecionado || !this.idUsuarioLogado || this.idServico === null) {
        this.mostrarAviso('Carregando Dados', 'Aguarde o carregamento do serviço e verificação do usuário.', false);
        return;
    }

    if (!this.dataSelecionada || !this.horarioSelecionado || !this.profissionalSelecionado) {
      const alert = await this.alertController.create({
        header: 'Campos Incompletos',
        message: 'Por favor, preencha todos os campos antes de confirmar.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const dataFormatada = new Date(this.dataSelecionada).toLocaleDateString('pt-BR');
    
    // Busca o nome do profissional selecionado para exibição
    const nomeProfissional = this.profissionaisDisponiveis.find(p => p.id === this.profissionalSelecionado)?.nome || 'Desconhecido';

    const alert = await this.alertController.create({
      header: 'Confirmar Agendamento',
      message: `
        Serviço: ${this.servicoSelecionado.nomeServico} --- 
        Preço: R$ ${this.servicoSelecionado.precoServico.toFixed(2)} ---
        Profissional: ${nomeProfissional} ---
        Data: ${dataFormatada} ---
        Horário: ${this.horarioSelecionado}
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.confirmarAgendamento();
          },
          cssClass: 'alert-button-confirm'
        }
      ],
      cssClass: 'agendamento-alert'
    });

    await alert.present();
  }

  confirmarAgendamento() {
    if (!this.servicoSelecionado || !this.idUsuarioLogado || this.idServico === null) {
        this.mostrarAviso('Erro de Dados', 'Dados do usuário ou serviço estão faltando.', false);
        return;
    }
    
    const idBarbeiro = this.getBarbeiroId(this.profissionalSelecionado);

    if (idBarbeiro === 0 || this.idServico === 0 || this.idUsuarioLogado === 0) {
      console.error('❌ ID de Barbeiro, Serviço ou Usuário está faltando/inválido. Agendamento abortado.');
      this.mostrarAviso('Erro de Agendamento', 'Um dos IDs necessários para o agendamento está inválido (Barbeiro/Serviço/Usuário).', false);
      return;
    }

    const dataObj = new Date(this.dataSelecionada as string);
    const dataFormatada = dataObj.toISOString().split('T')[0];
    const horaFormatada = `${this.horarioSelecionado as string}:00`;

    // 💡 CORREÇÃO PRINCIPAL: Mapear os nomes dos campos para corresponder ao modelo Java (Atendimento.java)
    const novoAgendamento: Agendamento = {
        idUsuarioAtendimento: this.idUsuarioLogado, // Alterado de idUsuario
        idBarbeiroAtendimento: idBarbeiro,         // Alterado de idBarbeiro
        idServicoAtendimento: this.idServico,      // Alterado de idServico
        dataAtendimento: dataFormatada,            // Alterado de data
        horaAtendimento: horaFormatada,            // Alterado de hora
        statusAtendimento: 'AGENDADO'              // Alterado de status
        // NOTA: idAtendimento não é enviado para o create
    };

    console.log('Tentando salvar agendamento:', novoAgendamento);

    this.agendamentoService.create(novoAgendamento).subscribe({
        next: (agendamentoSalvo) => {
            console.log('✅ Agendamento salvo:', agendamentoSalvo);
            const nomeProfissional = this.profissionaisDisponiveis.find(p => p.id === this.profissionalSelecionado)?.nome || 'Desconhecido';
            this.mostrarAviso(
              'Sucesso!', 
              `Seu agendamento para o serviço "${this.servicoSelecionado?.nomeServico}" com ${nomeProfissional} em ${dataFormatada} às ${this.horarioSelecionado} foi confirmado.`, 
              true
            );

            // Redireciona o cliente para a página de 'Atendimentos Marcados'
            setTimeout(() => {
              this.router.navigateByUrl('/atendimentos-marcados');
            }, 700);
        },
        error: (error) => {
            console.error('❌ Erro ao salvar agendamento:', error);
            let errorMessage = error.error?.message || 'Não foi possível completar o agendamento devido a um erro de servidor. Tente mais tarde.';

            // Tratamento específico para o Bad Request (400) com mensagem vaga
            if (error.status === 400) {
                if (errorMessage.includes('Todos os campos')) {
                    // A mensagem foi disparada devido à incompatibilidade de nomes (agora corrigida no objeto, mas mantemos o aviso)
                    errorMessage = 'A requisição é inválida. O servidor indicou que faltam campos obrigatórios. Verifique se os dados estão completos.';
                } else if (error.error?.message) {
                    // Usa a mensagem do servidor se for mais detalhada
                    errorMessage = error.error.message;
                } else {
                    // Mensagem genérica para 400
                    errorMessage = 'A requisição é inválida (Status 400). Verifique se o formato dos dados está correto.';
                }
            }
            
            this.mostrarAviso('Erro ao Agendar', errorMessage, false);
        }
    });
  }
}
