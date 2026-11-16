
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Compra } from '../models/compra';

export interface ComprobanteCompra {
  compraId: number;
  codigoComprobante: string;
  nombreCliente: string;
  pelicula: string;
  fechaFuncion: string;
  horaFuncion: string;
  sala: string;
  cantidadBoletos: number;
  metodoPago: string;
  valorTotal: number;
  fechaCompra: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  private apiUrl = 'http://localhost:8080/api/compras';

  constructor(private http: HttpClient) {}

  listar(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.apiUrl}/${id}`);
  }

  crear(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.apiUrl, compra);
  }

  obtenerComprobante(id: number): Observable<ComprobanteCompra> {
    return this.http.get<ComprobanteCompra>(`${this.apiUrl}/${id}/comprobante`);
  }

  // Eliminar una compra
  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text',
    });
  }

  // Eliminar todas las compras
  eliminarTodas(): Observable<string> {
    return this.http.delete(this.apiUrl, {
      responseType: 'text',
    });
  }
}
