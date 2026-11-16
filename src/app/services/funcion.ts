import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Funcion } from '../models/funcion';

@Injectable({
  providedIn: 'root',
})
export class FuncionService {
  private apiUrl = 'http://localhost:8080/api/funciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<Funcion[]> {
    return this.http.get<Funcion[]>(this.apiUrl);
  }

  crear(funcion: Funcion): Observable<Funcion> {
    return this.http.post<Funcion>(this.apiUrl, funcion);
  }

  actualizar(id: number, funcion: Funcion): Observable<Funcion> {
    return this.http.put<Funcion>(`${this.apiUrl}/${id}`, funcion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
