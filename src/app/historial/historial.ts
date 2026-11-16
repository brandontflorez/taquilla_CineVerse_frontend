import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompraService } from '../services/compra';
import { FuncionService } from '../services/funcion';
import { PeliculaService } from '../services/pelicula';

import { Compra } from '../models/compra';
import { Funcion } from '../models/funcion';
import { Pelicula } from '../models/pelicula';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  compras: Compra[] = [];
  funciones: Funcion[] = [];
  peliculas: Pelicula[] = [];

  cargando = false;
  error = '';
  mensaje = '';

  constructor(
    private compraService: CompraService,
    private funcionService: FuncionService,
    private peliculaService: PeliculaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.compraService.listar().subscribe({
      next: (datos: Compra[]) => {
        console.log('Compras recibidas en Angular:', datos);
        this.compras = datos;

        console.log('Cantidad de compras:', this.compras.length);

        this.funcionService.listar().subscribe({
          next: (funciones: Funcion[]) => {
            this.funciones = funciones;

            this.peliculaService.listar().subscribe({
              next: (peliculas: Pelicula[]) => {
                this.peliculas = peliculas;
                this.cargando = false;
                this.cdr.detectChanges();
              },
              error: (error: unknown) => {
                console.error('Error al cargar las películas:', error);
                this.error = 'No fue posible cargar las películas.';
                this.cargando = false;
                this.cdr.detectChanges();
              },
            });
          },
          error: (error: unknown) => {
            console.error('Error al cargar las funciones:', error);
            this.error = 'No fue posible cargar las funciones.';
            this.cargando = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (error: unknown) => {
        console.error('Error al cargar el historial:', error);
        this.error = 'No fue posible cargar el historial de compras.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Eliminar una compra
  eliminarCompra(compra: Compra): void {
    const confirmar = confirm(`¿Estás seguro de eliminar la compra #${compra.id}?`);

    if (!confirmar) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.compraService.eliminar(compra.id!).subscribe({
      next: () => {
        this.mensaje = 'Compra eliminada correctamente.';
        this.cargarDatos();
      },
      error: (error: unknown) => {
        console.error('Error al eliminar la compra:', error);
        this.error = 'No fue posible eliminar la compra.';
        this.cdr.detectChanges();
      },
    });
  }

  // Eliminar todo el historial
  eliminarTodasLasCompras(): void {
    if (this.compras.length === 0) {
      this.error = 'No hay compras para eliminar.';
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de eliminar todo el historial de compras? Esta acción no se puede deshacer.',
    );

    if (!confirmar) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.compraService.eliminarTodas().subscribe({
      next: () => {
        this.mensaje = 'Todo el historial fue eliminado correctamente.';
        this.cargarDatos();
      },
      error: (error: unknown) => {
        console.error('Error al eliminar el historial:', error);
        this.error = 'No fue posible eliminar el historial.';
        this.cdr.detectChanges();
      },
    });
  }

  obtenerFuncion(id: number): Funcion | undefined {
    return this.funciones.find((funcion) => funcion.id === id);
  }

  obtenerPelicula(compra: Compra): string {
    const funcion = this.obtenerFuncion(compra.funcionId);

    if (!funcion) {
      return 'Película no encontrada';
    }

    const pelicula = this.peliculas.find((pelicula) => pelicula.id === funcion.peliculaId);

    return pelicula ? pelicula.titulo : 'Película no encontrada';
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  calcularTotalVentas(): number {
    return this.compras.reduce((total, compra) => total + (compra.valorTotal ?? 0), 0);
  }
}
