import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitacao } from '../model/solicitacao';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SolicitacaoService {

  private apiUrl = environment.apiUrl + '/api/v1/solicitacao';
  private solicitacoesPendentes$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  // ------------------ CRUD BÁSICO ------------------

  /** Cria uma nova solicitação */
  criar(solicitacao: Solicitacao): Observable<Solicitacao> {
    return this.http.post<Solicitacao>(this.apiUrl, solicitacao, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Cria solicitacao usando o DTO esperado pelo backend (codigoProfissional, idBarbeariaRemetente) */
  criarComCodigo(dto: { codigoProfissional: number; idBarbeariaRemetente: number }): Observable<Solicitacao> {
    return this.http.post<Solicitacao>(this.apiUrl, dto, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getQtdSolicitacoesPendentes(): Observable<number> {
  return this.solicitacoesPendentes$.asObservable();
}

atualizarQtdSolicitacoesPendentes(idBarbeiro: number) {
  this.listarPorBarbeiro(idBarbeiro).subscribe({
    next: solicitacoes => {
      const qtd = solicitacoes.filter(s => s.estadoSolicitacao === 'PENDENTE').length;
      this.solicitacoesPendentes$.next(qtd);
    },
    error: () => this.solicitacoesPendentes$.next(0)
  });
}

  /** Atualiza uma solicitação existente */
  atualizar(solicitacao: Solicitacao): Observable<Solicitacao> {
    return this.http.put<Solicitacao>(
      `${this.apiUrl}/${solicitacao.idSolicitacao}`,
      solicitacao
    );
  }

  /** Busca uma solicitação pelo ID */
  buscarPorId(id: number): Observable<Solicitacao> {
    return this.http.get<Solicitacao>(`${this.apiUrl}/${id}`);
  }

  /** Lista todas as solicitações */
  listarTodas(): Observable<Solicitacao[]> {
    return this.http.get<Solicitacao[]>(this.apiUrl);
  }

  /** Remove uma solicitação */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ------------------ CONSULTAS ESPECÍFICAS ------------------

  /** Lista solicitações recebidas por um barbeiro */
  listarPorBarbeiro(idBarbeiro: number): Observable<Solicitacao[]> {
    return this.http.get<Solicitacao[]>(
      `${this.apiUrl}/barbeiro/${idBarbeiro}`
    );
  }

  /** Lista solicitações enviadas por uma barbearia */
  listarPorBarbearia(idBarbearia: number): Observable<Solicitacao[]> {
    return this.http.get<Solicitacao[]>(
      `${this.apiUrl}/barbearia/${idBarbearia}`
    );
  }

  // ------------------ AÇÕES DE NEGÓCIO ------------------

  aceitarSolicitacao(solicitacao: Solicitacao, idBarbeiro: number): Observable<void> {
  // Backend exposes PUT /{id}/aceitar
  return this.http.put<void>(`${this.apiUrl}/${solicitacao.idSolicitacao}/aceitar`, {}).pipe(
    tap(() => this.atualizarQtdSolicitacoesPendentes(idBarbeiro))
  );
}

  recusarSolicitacao(solicitacao: Solicitacao, idBarbeiro: number): Observable<void> {
  // Backend exposes PUT /{id}/recusar
  return this.http.put<void>(`${this.apiUrl}/${solicitacao.idSolicitacao}/recusar`, {}).pipe(
    tap(() => this.atualizarQtdSolicitacoesPendentes(idBarbeiro))
  );
}
}
