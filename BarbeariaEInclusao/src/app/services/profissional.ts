import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barbeiro } from '../model/barbeiro';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private apiUrl = environment.apiUrl + '/api/v1/barbeiro';
  private apiTagUrl = environment.apiUrl + '/api/v1/barbeiro-tag';
  private apiTagBase = environment.apiUrl + '/api/v1/tag';
  private barbeiro: Barbeiro | null = null;

  constructor(private http: HttpClient) {}

  // ------------------ CRUD BÁSICO ------------------

  cadastrar(barbeiro: Barbeiro): Observable<Barbeiro> {
    return this.http.post<Barbeiro>(this.apiUrl, barbeiro, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 💡 CORREÇÃO APLICADA: Mudança da chave 'barbeiroData' para 'barbeiro' no FormData
  cadastrarComFoto(barbeiro: Barbeiro, formData: FormData): Observable<Barbeiro> {
    // 1. Adiciona o objeto Barbeiro como JSON sob a chave 'barbeiro'
    const barbeiroBlob = new Blob([JSON.stringify(barbeiro)], { type: 'application/json' });
    formData.append('barbeiro', barbeiroBlob); 
    
    // 2. Chama o NOVO endpoint /com-foto para requisições multipart
    return this.http.post<Barbeiro>(`${this.apiUrl}/com-foto`, formData);
  }

  atualizar(barbeiro: Barbeiro): Observable<Barbeiro> {
    return this.http.put<Barbeiro>(`${this.apiUrl}/${barbeiro.idBarbeiro}`, barbeiro);
  }

  // 💡 CORREÇÃO APLICADA: Mudança da chave 'barbeiroData' para 'barbeiro' no FormData
  atualizarComFoto(barbeiro: Barbeiro, formData: FormData, id: number): Observable<Barbeiro> {
    // 1. Adiciona o objeto Barbeiro como JSON sob a chave 'barbeiro'
    const barbeiroBlob = new Blob([JSON.stringify(barbeiro)], { type: 'application/json' });
    formData.append('barbeiro', barbeiroBlob); 
    
    // 2. Chama o NOVO endpoint /com-foto/{id} para requisições multipart
    return this.http.put<Barbeiro>(`${this.apiUrl}/com-foto/${id}`, formData);
  }

  getBarbeiroById(id: number): Observable<Barbeiro> {
    return this.http.get<Barbeiro>(`${this.apiUrl}/${id}`);
  }

  getBarbeirosByBarbearia(idBarbearia: number): Observable<Barbeiro[]> {
    return this.http.get<Barbeiro[]>(`${this.apiUrl}/barbearia/${idBarbearia}`);
  }

  deletarBarbeiro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ------------------ AUTENTICAÇÃO ------------------

  autenticar(email: string, senha: string): Observable<Barbeiro> {
    const body = { emailBarbeiro: email, senhaBarbeiro: senha };
    return this.http.post<Barbeiro>(`${this.apiUrl}/login`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  registrar(barbeiro: Barbeiro) {
    this.barbeiro = barbeiro;
    // ATENÇÃO: Se for um aplicativo que exige segurança, é recomendável usar um mecanismo de autenticação mais robusto
    // como tokens JWT, em vez de armazenar o objeto completo no localStorage.
    localStorage.setItem('barbeiro', JSON.stringify(barbeiro));
  }

  getBarbeiroLogado(): Barbeiro | null {
    if (!this.barbeiro) {
      const saved = localStorage.getItem('barbeiro');
      this.barbeiro = saved ? JSON.parse(saved) : null;
    }
    return this.barbeiro;
  }

  encerrar() {
    this.barbeiro = null;
    localStorage.removeItem('barbeiro');
  }

  // ------------------ TAGS DE BARBEIRO ------------------

  /** Busca todas as tags disponíveis no sistema */
  buscarTags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiTagBase}`);
  }

  /** Busca as tags já associadas a um barbeiro específico */
  buscarTagsBarbeiro(idBarbeiro: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiTagUrl}/barbeiro/${idBarbeiro}`);
  }

  /** Salva (em lote) as tags de um barbeiro */
  salvarTagsBarbeiro(vinculos: any[]): Observable<any> {
    return this.http.post(`${this.apiTagUrl}/lote`, vinculos, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Remove um vínculo específico de tag com barbeiro */
  removerTagBarbeiro(idBarbeiro: number, idTag: number): Observable<void> {
    const body = { idBarbeiro, idTag };
    return this.http.request<void>('delete', this.apiTagUrl, { body });
  }

  /** Busca um barbeiro por código e o vincula à barbearia */
  buscarEVincularPorCodigo(codigoBarbeiro: string, idBarbearia: number): Observable<Barbeiro> {
    const payload = {
      codigoBarbeiro: codigoBarbeiro,
      idBarbearia: idBarbearia
    };
    return this.http.post<Barbeiro>(`${this.apiUrl}/vincular-por-codigo`, payload);
  }

  /** Remove o vínculo do barbeiro com a barbearia (desvincular) */
  removerVinculoPorId(idBarbeiro: number, idBarbearia: number): Observable<any> {
  const payload = { idBarbeiro, idBarbearia };
  // Agora aponta para o endpoint correto criado acima
  return this.http.post<any>(`${this.apiUrl}/desvincular`, payload);
}
}