import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  // ✅ CORREÇÃO 1: Separe as URLs base
  private apiTagBase = environment.apiUrl + '/api/v1/tag'; // Para tags GERAIS
  private apiVinculoUrl = environment.apiUrl + '/api/v1/barbeiro-tag'; // Para vínculos (BarbeiroTagController)

  constructor(private http: HttpClient) {}

  // 1. Busca tags GERAIS (correta)
  buscarTags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiTagBase}`);
  }

  // 2. Busca tags de um BARBEIRO (CORRIGIDO)
  buscarTagsBarbeiro(idBarbeiro: number): Observable<any[]> {
    // URL Corrigida: /api/v1/barbeiro-tag/barbeiro/{idBarbeiro}
    return this.http.get<any[]>(`${this.apiVinculoUrl}/barbeiro/${idBarbeiro}`);
  }

  // 3. Salva tags de um BARBEIRO (CORRIGIDO)
  salvarTagsBarbeiro(tags: any[]): Observable<void> {
    // ✅ CORREÇÃO: Apontando para o novo endpoint de lote no backend
    return this.http.post<void>(`${this.apiVinculoUrl}/lote`, tags);
  }
}