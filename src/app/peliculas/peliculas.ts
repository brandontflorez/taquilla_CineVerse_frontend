import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculaService } from '../services/pelicula';
import { Pelicula } from '../models/pelicula';

@Component({
  selector: 'app-peliculas',
  imports: [CommonModule, FormsModule],
  templateUrl: './peliculas.html',
  styleUrl: './peliculas.css',
})
export class Peliculas implements OnInit {
  peliculas: Pelicula[] = [];

  nuevaPelicula: Pelicula = {
    titulo: '',
    genero: '',
    duracion: 0,
    clasificacion: '',
    trailerUrl: '',
  };

  peliculaEditando: Pelicula | null = null;

  guardando = false;
  actualizando = false;

  // Duración para registrar
  horasNuevaPelicula = 0;
  minutosNuevaPelicula = 0;

  // Duración para editar
  horasEdicion = 0;
  minutosEdicion = 0;

  constructor(
    private peliculaService: PeliculaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
  }

  // LISTAR PELÍCULAS
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

  // CREAR PELÍCULA
  crearPelicula(): void {
    if (this.guardando) {
      return;
    }

    if (
      this.horasNuevaPelicula < 0 ||
      this.minutosNuevaPelicula < 0 ||
      this.minutosNuevaPelicula > 59
    ) {
      alert('Ingresa una duración válida. Los minutos deben estar entre 0 y 59.');
      return;
    }

    const duracionTotal = this.horasNuevaPelicula * 60 + this.minutosNuevaPelicula;

    if (duracionTotal <= 0) {
      alert('La duración debe ser mayor a cero.');
      return;
    }

    this.guardando = true;

    const peliculaNueva: Pelicula = {
      ...this.nuevaPelicula,
      duracion: duracionTotal,
    };

    this.peliculaService.crear(peliculaNueva).subscribe({
      next: () => {
        this.nuevaPelicula = {
          titulo: '',
          genero: '',
          duracion: 0,
          clasificacion: '',
          trailerUrl: '',
        };

        this.horasNuevaPelicula = 0;
        this.minutosNuevaPelicula = 0;

        this.guardando = false;

        this.cargarPeliculas();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al crear la película:', error);
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ELIMINAR PELÍCULA
  eliminarPelicula(id: number | undefined): void {
    if (!id) {
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta película?')) {
      return;
    }

    this.peliculaService.eliminar(id).subscribe({
      next: () => {
        this.peliculas = this.peliculas.filter((pelicula) => pelicula.id !== id);

        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al eliminar la película:', error);
      },
    });
  }

  // CARGAR DATOS PARA EDITAR
  editarPelicula(pelicula: Pelicula): void {
    this.peliculaEditando = { ...pelicula };

    this.horasEdicion = Math.floor(pelicula.duracion / 60);
    this.minutosEdicion = pelicula.duracion % 60;

    this.cdr.detectChanges();
  }

  // ACTUALIZAR PELÍCULA
  actualizarPelicula(): void {
    if (!this.peliculaEditando || !this.peliculaEditando.id || this.actualizando) {
      return;
    }

    if (this.horasEdicion < 0 || this.minutosEdicion < 0 || this.minutosEdicion > 59) {
      alert('Ingresa una duración válida. Los minutos deben estar entre 0 y 59.');
      return;
    }

    const duracionTotal = this.horasEdicion * 60 + this.minutosEdicion;

    if (duracionTotal <= 0) {
      alert('La duración debe ser mayor a cero.');
      return;
    }

    this.actualizando = true;

    const peliculaActualizada: Pelicula = {
      ...this.peliculaEditando,
      duracion: duracionTotal,
    };

    this.peliculaService.actualizar(peliculaActualizada.id!, peliculaActualizada).subscribe({
      next: () => {
        this.peliculas = this.peliculas.map((pelicula) =>
          pelicula.id === peliculaActualizada.id ? peliculaActualizada : pelicula,
        );

        this.peliculaEditando = null;
        this.actualizando = false;

        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al actualizar la película:', error);
        this.actualizando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // FORMATEAR DURACIÓN PARA LA TABLA
  formatearDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    if (minutosRestantes === 0) {
      return `${horas} h`;
    }

    return `${horas} h ${minutosRestantes} min`;
  }
}
