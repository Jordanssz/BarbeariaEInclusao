import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AvaliacaoPayload {
  idAtendimento: number;
  nota: number; // 1..5
  comentario?: string;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly apiUrl = environment.apiUrl + '/api/v1/avaliacao';

  constructor(private http: HttpClient) {}

  create(payload: AvaliacaoPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
