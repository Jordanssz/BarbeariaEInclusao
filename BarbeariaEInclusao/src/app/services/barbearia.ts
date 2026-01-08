import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Barbearia } from '../model/barbearia';
import { environment } from 'src/environments/environment'; // Adicionando importação para apiUrl

// 💡 NOVO TIPO: Interface que estende Barbearia para incluir o campo de distância 
// que é retornado pelo backend (BarbeariaComDistanciaDto).
interface BarbeariaComDistancia extends Barbearia {
  distanciaKm?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BarbeariaService {

  // Assumindo que a variável de ambiente está configurada
  private apiUrl = environment.apiUrl + '/api/v1/barbearia'; 

  constructor(private http: HttpClient) { }

  // ------------------ MÉTODO DE LISTAGEM GERAL CORRIGIDO ------------------
  /** * Lista todas as barbearias cadastradas, ordenadas por distância se a localização for fornecida.
   * Retorna BarbeariaComDistancia[] para incluir o campo distanciaKm. 
   */
  findAll(latitude?: number, longitude?: number): Observable<BarbeariaComDistancia[]> { // ⬅️ Tipagem corrigida
    let params = new HttpParams();

    if (latitude !== undefined && longitude !== undefined) {
      // Adiciona a localização do cliente como Query Parameters
      params = params.set('latitude', latitude.toString());
      params = params.set('longitude', longitude.toString());
    }
    
    // O backend deve usar esses parâmetros para calcular a distância e ordenar.
    // O Observable agora retorna o novo tipo.
    return this.http.get<BarbeariaComDistancia[]>(`${this.apiUrl}`, { params }); // ⬅️ Tipagem corrigida
  }
  // -------------------------------------------------------------------

  // --- NOVO MÉTODO: Atualiza apenas a Latitude e Longitude ---
  atualizarLocalizacao(idBarbearia: number, latitude: number, longitude: number): Observable<Barbearia> {
    const payload = {
      latitude: latitude,
      longitude: longitude
    };
    return this.http.put<Barbearia>(`${this.apiUrl}/${idBarbearia}/localizacao`, payload).pipe(
      tap(barbeariaAtualizada => this.registrar(barbeariaAtualizada))
    );
  }
  // -----------------------------------------------------------

  // Autenticação da barbearia
  autenticar(email: string, senha: string): Observable<Barbearia> {
    const objetoJS = {
      emailBarbearia: email,
      senhaBarbearia: senha
    };
    return this.http.post<Barbearia>(`${this.apiUrl}/autenticar`, objetoJS).pipe(
      tap(barbearia => this.registrar(barbearia))
    );
  }

  // Carregar barbearia logada do localStorage
  carregar(): Barbearia {
    const barbeariaData = localStorage.getItem('barbeariaAutenticada');
    // Você precisará da classe Barbearia importada ou definida para isso funcionar
    // return barbeariaData ? JSON.parse(barbeariaData) : new Barbearia(); 
    return barbeariaData ? JSON.parse(barbeariaData) : ({} as Barbearia); // Exemplo simplificado
  }

  // Registrar barbearia no localStorage
  registrar(barbearia: Barbearia) {
    if (barbearia.fotoBarbearia && !barbearia.fotoBarbearia.startsWith('data:')) {
      barbearia.fotoBarbearia = 'data:image/png;base64,' + barbearia.fotoBarbearia;
    }
    localStorage.setItem('barbeariaAutenticada', JSON.stringify(barbearia));
  }

  // Encerrar sessão
  encerrar() {
    localStorage.removeItem('barbeariaAutenticada');
  }

  // Cadastro sem foto
  cadastrar(barbearia: Barbearia): Observable<Barbearia> {
    console.log('Barbearia enviada:', barbearia);
    return this.http.post<Barbearia>(`${this.apiUrl}/cadastrar`, barbearia).pipe(
      tap(barbeariaRegistrada => this.registrar(barbeariaRegistrada))
    );
  }

  // Cadastro com foto
  cadastrarComFoto(formData: FormData): Observable<Barbearia> {
    return this.http.post<Barbearia>(`${this.apiUrl}/cadastrar-com-foto`, formData).pipe(
      tap(barbeariaRegistrada => this.registrar(barbeariaRegistrada))
    );
  }

  // Atualização sem foto
  atualizar(barbearia: Barbearia): Observable<Barbearia> {
    return this.http.put<Barbearia>(`${this.apiUrl}/${barbearia.idBarbearia}`, barbearia).pipe(
      tap(barbeariaAtualizada => this.registrar(barbeariaAtualizada))
    );
  }

  // Atualização com foto
  atualizarComFoto(formData: FormData, idBarbearia: number): Observable<Barbearia> {
    return this.http.put<Barbearia>(`${this.apiUrl}/atualizar-com-foto/${idBarbearia}`, formData).pipe(
      tap(barbeariaAtualizada => this.registrar(barbeariaAtualizada))
    );
  }

  // Pegar barbearia logada pelo ID
  getBarbeariaLogada(): Observable<Barbearia> {
    const barbeariaLocal = this.carregar();
    if (!barbeariaLocal.idBarbearia) {
        return new Observable<Barbearia>(observer => {
            observer.error('ID da barbearia não encontrado no localStorage.');
            observer.complete();
        });
    }

    return this.http.get<Barbearia>(`${this.apiUrl}/${barbeariaLocal.idBarbearia}`).pipe(
      tap(barbeariaFresca => this.registrar(barbeariaFresca))
    );
  }
  
  // Listar serviços da barbearia
  listarServicos(idBarbearia: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idBarbearia}/servicos`);
  }

  // Excluir barbearia
  excluir(idBarbearia: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/excluir/${idBarbearia}`);
  }

  buscarCaracteristicas(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/v1/caracteristica`);
  }

  /** Salva as respostas de características para uma barbearia */
  salvarCaracteristicasBarbearia(respostas: any[]): Observable<any> {
    return this.http.post(`http://localhost:8080/api/v1/barbearia-caracteristica/lote`, respostas);
  }

  /** Busca as características já salvas de uma barbearia específica */
  buscarCaracteristicasBarbearia(idBarbearia: number): Observable<any[]> {
    const urlCorreta = `http://localhost:8080/api/v1/barbearia-caracteristica/barbearia/${idBarbearia}`;
    return this.http.get<any[]>(urlCorreta);
  }

  buscarPorId(idBarbearia: number): Observable<Barbearia> {
    return this.http.get<Barbearia>(`${this.apiUrl}/${idBarbearia}`);
  }
}
