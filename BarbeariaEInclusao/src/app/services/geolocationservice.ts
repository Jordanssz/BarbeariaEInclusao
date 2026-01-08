import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface para estruturar a resposta do Nominatim
interface NominatimResponse {
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  // URL do serviço Nominatim (OpenStreetMap)
  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) { }

  /**
   * Converte latitude e longitude em um endereço legível.
   * @param lat Latitude
   * @param lon Longitude
   * @returns Observable de string contendo o endereço formatado.
   */
  getFormattedAddress(lat: number, lon: number): Observable<string> {
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      return throwError(() => new Error('Coordenadas de latitude e longitude inválidas.'));
    }
    
    // Parâmetros para a chamada de geocodificação reversa
    const params = {
      lat: String(lat),
      lon: String(lon),
      format: 'json',
      // Inclui a quebra de endereço para formatação manual
      addressdetails: '1' 
    };

    return this.http.get<NominatimResponse>(this.nominatimUrl, { params }).pipe(
      map(response => {
        // Se a resposta tiver um display_name, use-o
        if (response && response.display_name) {
          return response.display_name;
        }
        
        // Tentativa de construir um endereço formatado se display_name não for ideal
        const addr = response.address;
        const addressParts: (string | undefined)[] = [
          addr.road,
          addr.house_number,
          addr.suburb,
          addr.city,
          addr.state,
          addr.postcode
        ];

        // Filtra partes vazias e junta
        return addressParts.filter(part => part).join(', ');

      }),
      catchError(error => {
        console.error('Erro na Geocodificação Reversa:', error);
        return throwError(() => new Error('Não foi possível obter o endereço.'));
      })
    );
  }
}
