import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../model/agendamento';
import { environment } from 'src/environments/environment'; // ⬅️ Importação Adicionada

/**
 * Serviço responsável por gerenciar a comunicação com a API de Agendamentos (Atendimento).
 * Base URL: /api/v1/atendimento
 */
@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  // 💡 USANDO ENVIRONMENT: A URL base é configurada dinamicamente
  private readonly apiUrl = environment.apiUrl + '/api/v1/atendimento';

  // O HttpClient é injetado no construtor para realizar as requisições.
  constructor(private http: HttpClient) { }

  /**
   * Obtém todos os agendamentos.
   * Corresponde ao GET /api/v1/atendimento
   * @returns Um Observable com uma lista de Agendamentos.
   */
  getAll(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }
  
  /**
   * Obtém todos os agendamentos de um usuário específico.
   * Corresponde ao GET /api/v1/atendimento/usuario/{idUsuario}
   * @param idUsuario O ID do usuário (cliente).
   * @returns Um Observable com uma lista de Agendamentos.
   */
  getAgendamentosByUserId(idUsuario: number): Observable<Agendamento[]> {
    const url = `${this.apiUrl}/usuario/${idUsuario}`;
    return this.http.get<Agendamento[]>(url);
  }

  /**
   * Obtém um agendamento pelo ID.
   * Corresponde ao GET /api/v1/atendimento/{id}
   * @param id O ID do agendamento.
   * @returns Um Observable com o Agendamento.
   */
  getById(id: number): Observable<Agendamento> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Agendamento>(url);
  }

  /**
   * Cria um novo agendamento.
   * Corresponde ao POST /api/v1/atendimento
   * @param agendamento O objeto Agendamento a ser criado.
   * @returns Um Observable com o Agendamento criado, incluindo o ID.
   */
  create(agendamento: Agendamento): Observable<Agendamento> {
    // O backend espera que o ID seja nulo/opcional na criação.
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  /**
   * Atualiza um agendamento existente.
   * Corresponde ao PUT /api/v1/atendimento/{id}
   * @param agendamento O objeto Agendamento a ser atualizado.
   * @returns Um Observable com o Agendamento atualizado.
   */
  update(agendamento: Agendamento): Observable<Agendamento> {
    if (agendamento.idAtendimento === undefined) {
      throw new Error('ID do agendamento deve ser fornecido para a atualização.');
    }
    const url = `${this.apiUrl}/${agendamento.idAtendimento}`;
    return this.http.put<Agendamento>(url, agendamento);
  }

  /**
   * Exclui um agendamento pelo ID.
   * Corresponde ao DELETE /api/v1/atendimento/{id}
   * @param id O ID do agendamento a ser excluído.
   * @returns Um Observable vazio (void).
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
