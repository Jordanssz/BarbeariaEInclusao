import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Avaliacao } from '../model/avaliacao'; // Importe o model que criamos anteriormente
import { AgendamentoService } from './agendamento';
import { ServicoService } from './servico';
import { ProfissionalService } from './profissional';
import { UsuarioService } from './usuario';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/avaliacao`;

  constructor(
    private http: HttpClient,
    private agendamentoService: AgendamentoService,
    private servicoService: ServicoService,
    private profissionalService: ProfissionalService,
    private usuarioService: UsuarioService
  ) {}

  // POST: /api/v1/avaliacao
  create(avaliacao: Avaliacao): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(this.apiUrl, avaliacao);
  }

  // GET: /api/v1/avaliacao
  getAll(): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(this.apiUrl);
  }

  // GET: /api/v1/avaliacao/{id}
  getById(id: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.apiUrl}/${id}`);
  }

  // GET: /api/v1/avaliacao/atendimento/{idAtendimento}
  getByAtendimento(idAtendimento: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.apiUrl}/atendimento/${idAtendimento}`);
  }

  // PUT: /api/v1/avaliacao/{id}
  update(id: number, avaliacao: Avaliacao): Observable<Avaliacao> {
    return this.http.put<Avaliacao>(`${this.apiUrl}/${id}`, avaliacao);
  }

  // DELETE: /api/v1/avaliacao/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Helpers para calcular média e listar comentários por barbearia/barbeiro ---

  /**
   * Calcula a média no formato pedido: (soma das notas * 2) / quantidade -> valor 0..10
   */
  async calcularMediaPorBarbearia(idBarbearia: number): Promise<number> {
    try {
      const avaliacoes = await firstValueFrom(this.getAll());
      const relevantes: number[] = [];

      for (const a of avaliacoes || []) {
        try {
          const ag = await firstValueFrom(this.agendamentoService.getById(a.idAtendimentoAvaliacao));
          if (!ag) continue;
          const serv = await firstValueFrom(this.servicoService.buscarPorId(ag.idServicoAtendimento));
          const idBarb = (serv && (serv as any).idBarbearia) || (serv && (serv as any).idBarbeariaServico) || null;
          if (Number(idBarb) === Number(idBarbearia)) {
            relevantes.push(Number(a.nota) || 0);
          }
        } catch (err) {
          // ignora avaliação com dados faltantes
        }
      }

      if (relevantes.length === 0) return 0;
      const soma = relevantes.reduce((s, v) => s + v, 0);
      return (soma * 2) / relevantes.length; // valor 0..10
    } catch (err) {
      console.error('Erro ao calcular média por barbearia:', err);
      return 0;
    }
  }

  async listarComentariosPorBarbearia(idBarbearia: number): Promise<any[]> {
    const resultados: any[] = [];
    try {
      const avaliacoes = await firstValueFrom(this.getAll());
      for (const a of avaliacoes || []) {
        try {
          const ag: any = await firstValueFrom(this.agendamentoService.getById(a.idAtendimentoAvaliacao));
          if (!ag) continue;
          const serv: any = await firstValueFrom(this.servicoService.buscarPorId(ag.idServicoAtendimento));
          const idBarb = (serv && serv.idBarbearia) || (serv && serv.idBarbeariaServico) || null;
          if (Number(idBarb) === Number(idBarbearia)) {
            let prof: any = null;
            try {
              const profId = ag.idBarbeiroAtendimento ?? ag.idProfissionalAtendimento ?? null;
              if (profId) prof = await firstValueFrom(this.profissionalService.getBarbeiroById(profId));
            } catch (e) {
              prof = null;
            }

            let user: any = null;
            try {
              if (this.usuarioService.getById) user = await firstValueFrom(this.usuarioService.getById(ag.idUsuarioAtendimento));
            } catch (e) {
              user = null;
            }

            resultados.push({
              nomeUsuario: (user && (user.nome || user.apelido)) || 'Usuário',
              nomeServico: (serv && (serv.nomeServico || serv.nome)) || 'Serviço',
              nomeProfissional: (prof && (prof.nomeProfissional || prof.nome)) || 'Profissional',
              nota: a.nota,
              comentario: a.comentario || '',
              data: ag.dataAtendimento || ag.data || null,
              hora: ag.horaAtendimento || ag.hora || null
            });
          }
        } catch (err) {
          // ignora entradas com dados faltantes
        }
      }

      // ordenar mais recentes primeiro, quando possível
      resultados.sort((x, y) => {
        const dx = x.data ? new Date((x.data) + 'T' + (x.hora || '00:00:00')) : new Date(0);
        const dy = y.data ? new Date((y.data) + 'T' + (y.hora || '00:00:00')) : new Date(0);
        return dy.getTime() - dx.getTime();
      });
    } catch (err) {
      console.error('Erro ao listar comentários por barbearia:', err);
    }
    // remove campos internos antes de retornar
    return resultados.map(r => ({
      nomeUsuario: r.nomeUsuario,
      nomeServico: r.nomeServico,
      nomeProfissional: r.nomeProfissional,
      nota: r.nota,
      comentario: r.comentario
    }));
  }

  async calcularMediaPorBarbeiro(idBarbeiro: number): Promise<number> {
    try {
      const avaliacoes = await firstValueFrom(this.getAll());
      const relevantes: number[] = [];
      for (const a of avaliacoes || []) {
        try {
          const ag = await firstValueFrom(this.agendamentoService.getById(a.idAtendimentoAvaliacao));
          if (!ag) continue;
          if (Number(ag.idBarbeiroAtendimento) === Number(idBarbeiro)) {
            relevantes.push(Number(a.nota) || 0);
          }
        } catch { }
      }
      if (relevantes.length === 0) return 0;
      const soma = relevantes.reduce((s, v) => s + v, 0);
      return (soma * 2) / relevantes.length;
    } catch (err) {
      console.error('Erro ao calcular média por barbeiro:', err);
      return 0;
    }
  }

  async listarComentariosPorBarbeiro(idBarbeiro: number): Promise<any[]> {
    const resultados: any[] = [];
    try {
      const avaliacoes = await firstValueFrom(this.getAll());
      for (const a of avaliacoes || []) {
        try {
          const ag: any = await firstValueFrom(this.agendamentoService.getById(a.idAtendimentoAvaliacao));
          if (!ag) continue;
          if (Number(ag.idBarbeiroAtendimento) === Number(idBarbeiro)) {
            const serv: any = await firstValueFrom(this.servicoService.buscarPorId(ag.idServicoAtendimento));

            let user: any = null;
            try { if (this.usuarioService.getById) user = await firstValueFrom(this.usuarioService.getById(ag.idUsuarioAtendimento)); } catch { user = null; }

            let prof: any = null;
            try { if (ag.idBarbeiroAtendimento) prof = await firstValueFrom(this.profissionalService.getBarbeiroById(ag.idBarbeiroAtendimento)); } catch { prof = null; }

            resultados.push({
              nomeUsuario: (user && (user.nome || user.apelido)) || 'Usuário',
              nomeServico: (serv && (serv.nomeServico || serv.nome)) || 'Serviço',
              nomeProfissional: (prof && (prof.nomeProfissional || prof.nome)) || '',
              nota: a.nota,
              comentario: a.comentario || '',
              data: ag.dataAtendimento || ag.data || null,
              hora: ag.horaAtendimento || ag.hora || null
            });
          }
        } catch { }
      }

      resultados.sort((x, y) => {
        const dx = x.data ? new Date((x.data) + 'T' + (x.hora || '00:00:00')) : new Date(0);
        const dy = y.data ? new Date((y.data) + 'T' + (y.hora || '00:00:00')) : new Date(0);
        return dy.getTime() - dx.getTime();
      });
    } catch (err) {
      console.error('Erro ao listar comentários por barbeiro:', err);
    }
    return resultados.map(r => ({
      nomeUsuario: r.nomeUsuario,
      nomeServico: r.nomeServico,
      nomeProfissional: r.nomeProfissional,
      nota: r.nota,
      comentario: r.comentario
    }));
  }

}