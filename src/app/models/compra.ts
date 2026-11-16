import { Funcion } from './funcion';

export interface Compra {
  id?: number;
  funcionId: number;
  nombreCliente: string;
  cantidadBoletos: number;
  metodoPago?: string;
  codigoPago?: string;
  valorTotal?: number;
  fechaCompra?: string;
}
