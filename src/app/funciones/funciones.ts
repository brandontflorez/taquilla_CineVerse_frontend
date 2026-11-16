
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionService } from '../services/funcion';
import { PeliculaService } from '../services/pelicula';
import { Funcion } from '../models/funcion';
import { Pelicula } from '../models/pelicula';

@Component({
  selector: 'app-funciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './funciones.html',
  styleUrl: './funciones.css',
})
export class Funciones implements OnInit {
  funciones: Funcion[] = [];
  peliculas: Pelicula[] = [];

  mensaje: string = '';
  error: string = '';

  nuevaFuncion: Funcion = {
    peliculaId: 0,
    fecha: '',
    hora: '',
    sala: '',
    precio: 0,
    cuposDisponibles: 0,
  };

  funcionEditando: Funcion | null = null;

  guardando = false;
  actualizando = false;
  eliminando = false;

  constructor(
    private funcionService: FuncionService,
    private peliculaService: PeliculaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarFunciones();
    this.cargarPeliculas();
  }

  cargarFunciones(): void {
    this.funcionService.listar().subscribe({
      next: (datos: Funcion[]) => {
        this.funciones = datos;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al cargar las funciones:', error);
      },
    });
  }

  cargarPeliculas(): void {
    this.peliculaService.listar().subscribe({
      next: (datos: Pelicula[]) => {
        this.peliculas = datos;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al cargar las películas:', error);
      },
    });
  }

  crearFuncion(): void {
    if (this.guardando) {
      return;
    }

    this.mensaje = '';
    this.error = '';
    this.guardando = true;

    this.funcionService.crear(this.nuevaFuncion).subscribe({
      next: () => {
        this.mensaje = 'Función creada correctamente.';

        this.nuevaFuncion = {
          peliculaId: 0,
          fecha: '',
          hora: '',
          sala: '',
          precio: 0,
          cuposDisponibles: 0,
        };

        this.guardando = false;
        this.cargarFunciones();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al crear la función:', error);
        this.error = 'No fue posible crear la función.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminarFuncion(id: number): void {
    if (this.eliminando) {
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta función?')) {
      return;
    }

    this.mensaje = '';
    this.error = '';
    this.eliminando = true;

    this.funcionService.eliminar(id).subscribe({
      next: () => {
        this.funciones = this.funciones.filter(
          (funcion) => Number(funcion.id) !== Number(id),
        );

        this.mensaje = 'Función eliminada correctamente.';
        this.eliminando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al eliminar la función:', err);

        if (err.status === 409) {
          this.error =
            'No se puede eliminar esta función porque tiene compras registradas.';
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error =
            'No se puede eliminar esta función porque tiene compras asociadas.';
        }

        this.eliminando = false;
        this.cdr.detectChanges();
      },
    });
  }

  editarFuncion(funcion: Funcion): void {
    this.mensaje = '';
    this.error = '';
    this.funcionEditando = { ...funcion };
    this.cdr.detectChanges();
  }

  actualizarFuncion(): void {
    if (
      !this.funcionEditando ||
      !this.funcionEditando.id ||
      this.actualizando
    ) {
      return;
    }

    this.mensaje = '';
    this.error = '';
    this.actualizando = true;

    const funcionActualizada = { ...this.funcionEditando };

    this.funcionService
      .actualizar(funcionActualizada.id!, funcionActualizada)
      .subscribe({
        next: () => {
          this.funciones = this.funciones.map((funcion) =>
            funcion.id === funcionActualizada.id
              ? funcionActualizada
              : funcion,
          );

          this.mensaje = 'Función actualizada correctamente.';
          this.funcionEditando = null;
          this.actualizando = false;
          this.cdr.detectChanges();
        },
        error: (error: unknown) => {
          console.error('Error al actualizar la función:', error);
          this.error = 'No fue posible actualizar la función.';
          this.actualizando = false;
          this.cdr.detectChanges();
        },
      });
  }

  obtenerTituloPelicula(peliculaId: number): string {
    const pelicula = this.peliculas.find(
      (pelicula) => pelicula.id === peliculaId,
    );

    return pelicula ? pelicula.titulo : 'Película no encontrada';
  }

  formatearPrecio(precio: number | undefined): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio ?? 0);
  }

  // FORMATO DE HORA AM/PM

  formatearHora(hora: string): string {
    if (!hora) {
      return '';
    }

    const [horas, minutos] = hora.split(':').map(Number);

    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);

    return fecha.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
