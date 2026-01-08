import { Component, OnInit } from '@angular/core';
import { AgendamentoService } from 'src/app/services/agendamento';
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
}

@Component({
  selector: 'app-agenda-barbeiro',
  templateUrl: './agenda-barbeiro.page.html',
  styleUrls: ['./agenda-barbeiro.page.scss'],
  standalone: false
})
export class AgendaBarbeiroPage implements OnInit {

  agendamentos: AgendamentoDisplay[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  // Calendário
  currentMonth!: number; // 0-11
  currentYear!: number;
  calendarWeeks: Array<Array<{ dateISO: string; dayNumber: number; inMonth: boolean; appointments: AgendamentoDisplay[] }>> = [];
  selectedDateISO: string | null = null;

  // Mock de nomes de clientes (fallback)
  private mockNomesClientes: { [key: number]: string } = {
    1: 'João Silva',
    2: 'Maria Santos',
    3: 'Pedro Oliveira'
  };

  constructor(
    private agendamentoService: AgendamentoService,
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

  // Formata a data/hora para exibição amigável
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

  carregarAgendamentos() {
    this.isLoading = true;
    this.errorMessage = null;

    const barbeiro = this.profissionalService.getBarbeiroLogado();
    if (!barbeiro || !barbeiro.idBarbeiro) {
      this.errorMessage = 'Barbeiro não encontrado. Faça login novamente.';
      this.isLoading = false;
      return;
    }

    this.agendamentoService.getAll().pipe(
      switchMap((agendamentos: Agendamento[]) => {
        // Filtrar apenas agendamentos deste barbeiro
        const meus = agendamentos.filter(a => a.idBarbeiroAtendimento === barbeiro.idBarbeiro);

        if (meus.length === 0) {
          return of([]);
        }

        const chamadas = meus.map(ag =>
          forkJoin({
            servico: this.servicoService.buscarPorId(ag.idServicoAtendimento).pipe(catchError(() => of(null))),
            cliente: this.usuarioService.findById(ag.idUsuarioAtendimento).pipe(catchError(() => of(null)))
          }).pipe(
            map(({ servico, cliente }) => ({
              ...ag,
              nomeCliente: (cliente && (cliente as any).nomeUsuario) || this.mockNomesClientes[ag.idUsuarioAtendimento] || `Cliente ID ${ag.idUsuarioAtendimento}`,
              nomeServico: (servico && (servico as any).nomeServico) || `Serviço ID ${ag.idServicoAtendimento}`
            }) as AgendamentoDisplay)
          )
        );

        return forkJoin(chamadas);
      }),
      catchError(error => {
        console.error('Erro ao carregar agendamentos do barbeiro:', error);
        this.errorMessage = 'Erro ao carregar agenda. Tente novamente mais tarde.';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (lista: AgendamentoDisplay[]) => {
        this.agendamentos = lista;
        this.isLoading = false;
        if (this.agendamentos.length === 0 && !this.errorMessage) {
          this.errorMessage = 'Nenhum agendamento encontrado.';
        }
        // Depois de carregar, montar calendário
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
    // Agrupa agendamentos por data (YYYY-MM-DD)
    const map: { [iso: string]: AgendamentoDisplay[] } = {};
    (this.agendamentos || []).forEach(a => {
      const key = a.dataAtendimento;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    // Primeiro dia exibido na grade (começando no domingo)
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

  async confirmarCancelamento(agendamento: AgendamentoDisplay) {
    const alert = await this.alertController.create({
      header: 'Cancelar agendamento',
      message: `Deseja realmente cancelar o serviço <b>${agendamento.nomeServico}</b> para <b>${agendamento.nomeCliente}</b>?`,
      buttons: [
        { text: 'Não', role: 'cancel' },
        { text: 'Sim, cancelar', handler: () => this.cancelarAgendamento(agendamento) }
      ]
    });

    await alert.present();
  }

  cancelarAgendamento(agendamento: AgendamentoDisplay) {
    this.agendamentoService.delete(agendamento.idAtendimento!).subscribe({
      next: async () => {
        this.agendamentos = this.agendamentos.filter(a => a.idAtendimento !== agendamento.idAtendimento);
        const toast = await this.toastController.create({ message: 'Agendamento cancelado com sucesso!', duration: 2000, color: 'success' });
        await toast.present();
        if (this.agendamentos.length === 0) this.errorMessage = 'Nenhum agendamento encontrado.';
      },
      error: async (err) => {
        console.error('Erro ao cancelar agendamento:', err);
        const toast = await this.toastController.create({ message: 'Erro ao cancelar agendamento. Tente novamente.', duration: 2500, color: 'danger' });
        await toast.present();
      }
    });
  }

}
