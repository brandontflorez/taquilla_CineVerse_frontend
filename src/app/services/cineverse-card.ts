import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CineVerseCard {
  id: number;
  numeroTarjeta: string;
  nombreTitular: string;
  saldo: number;
}

@Injectable({
  providedIn: 'root',
})
export class CineVerseCardService {
  private apiUrl = 'http://localhost:8080/api/cineverse-cards';

  constructor(private http: HttpClient) {}

  consultarPorNumero(numeroTarjeta: string): Observable<CineVerseCard> {
    return this.http.get<CineVerseCard>(
      `${this.apiUrl}/numero/${encodeURIComponent(numeroTarjeta)}`,
    );
  }

  recargarSaldo(id: number, valor: number): Observable<CineVerseCard> {
    return this.http.post<CineVerseCard>(`${this.apiUrl}/${id}/recargar`, { valor });
  }
}
