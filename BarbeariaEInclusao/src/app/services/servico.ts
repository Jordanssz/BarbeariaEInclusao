import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico } from 'src/app/model/servico';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private apiUrl = 'http://localhost:8080/api/v1/servico';

  constructor(private http: HttpClient) {}

  listarPorBarbearia(idBarbearia: number): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/barbearia/${idBarbearia}`);
  }

  salvar(servico: Servico): Observable<Servico> {
    const payload: any = {
      // camelCase (para desserialização padrão do backend Java)
      idServico: servico.idServico && servico.idServico !== 0 ? servico.idServico : undefined,
      nomeServico: servico.nomeServico,
      descricaoServico: servico.descricaoServico,
      precoServico: servico.precoServico,
      fotoServico: servico.fotoServico,
      idBarbeariaServico: servico.idBarbeariaServico,
      idBarbeiroServico: servico.idBarbeiroServico,
      // snake_case (fallback caso backend use esse padrão)
      id_servico: servico.idServico && servico.idServico !== 0 ? servico.idServico : undefined,
      nome_servico: servico.nomeServico,
      descricao_servico: servico.descricaoServico,
      preco_servico: servico.precoServico,
      foto_servico: servico.fotoServico,
      id_barbearia_servico: servico.idBarbeariaServico,
      id_barbeiro_servico: servico.idBarbeiroServico
    };

    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });

    return this.http.post<Servico>(this.apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }

  atualizar(servico: Servico): Observable<Servico> {
    const payload: any = {
      // camelCase
      idServico: servico.idServico,
      nomeServico: servico.nomeServico,
      descricaoServico: servico.descricaoServico,
      precoServico: servico.precoServico,
      fotoServico: servico.fotoServico,
      idBarbeariaServico: servico.idBarbeariaServico,
      idBarbeiroServico: servico.idBarbeiroServico,
      // snake_case fallback
      id_servico: servico.idServico,
      nome_servico: servico.nomeServico,
      descricao_servico: servico.descricaoServico,
      preco_servico: servico.precoServico,
      foto_servico: servico.fotoServico,
      id_barbearia_servico: servico.idBarbeariaServico,
      id_barbeiro_servico: servico.idBarbeiroServico
    };

    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });

    return this.http.put<Servico>(`${this.apiUrl}/${servico.idServico}`, payload);
  }

  excluir(idServico: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idServico}`);
  }
}
