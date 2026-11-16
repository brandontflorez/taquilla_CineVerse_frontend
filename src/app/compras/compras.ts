
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompraService, ComprobanteCompra } from '../services/compra';
import { FuncionService } from '../services/funcion';
import { PeliculaService } from '../services/pelicula';
import { CineVerseCardService, CineVerseCard } from '../services/cineverse-card';

import { Compra } from '../models/compra';
import { Funcion } from '../models/funcion';
import { Pelicula } from '../models/pelicula';

@Component({
  selector: 'app-compras',
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras implements OnInit {

  compras: Compra[] = [];
  funciones: Funcion[] = [];
  peliculas: Pelicula[] = [];

  comprobante: ComprobanteCompra | null = null;

  // =====================================
  // CINEVERSE CARD
  // =====================================

  tarjetaCineVerse: CineVerseCard | null = null;

  consultandoTarjeta = false;
  recargando = false;

  valorRecarga = 10000;
  valorRecargaTexto = '10.000';

  mensajeRecarga = '';
  errorRecarga = '';
  errorTarjeta = '';

  // =====================================
  // MÉTODOS DE PAGO
  // =====================================

  metodosPago = [
    { valor: 'TARJETA', nombre: '💳 Tarjeta' },
    { valor: 'VIRTUAL', nombre: '📱 Pago virtual' },
    { valor: 'CODIGO', nombre: '🔢 Código de pago' },
    { valor: 'CINEVERSE_CARD', nombre: '🎬 CineVerse Card' },
  ];

  // =====================================
  // NUEVA COMPRA
  // =====================================

  nuevaCompra: Compra = {
    funcionId: 0,
    nombreCliente: '',
    cantidadBoletos: 1,
    metodoPago: '',
    codigoPago: '',
  };

  mensaje = '';
  error = '';
  guardando = false;

  constructor(
    private compraService: CompraService,
    private funcionService: FuncionService,
    private peliculaService: PeliculaService,
    private cineVerseCardService: CineVerseCardService,
    private cdr: ChangeDetectorRef,
  ) {}

  // =====================================
  // INICIALIZAR COMPONENTE
  // =====================================

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarFunciones();
    this.cargarPeliculas();
  }

  // =====================================
  // CARGAR COMPRAS
  // =====================================

  cargarCompras(): void {
    this.compraService.listar().subscribe({
      next: (datos) => {
        this.compras = datos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
      },
    });
  }

  // =====================================
  // CARGAR FUNCIONES
  // =====================================

  cargarFunciones(): void {
    this.funcionService.listar().subscribe({
      next: (datos) => {
        this.funciones = datos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar funciones:', error);
      },
    });
  }

  // =====================================
  // CARGAR PELÍCULAS
  // =====================================

  cargarPeliculas(): void {
    this.peliculaService.listar().subscribe({
      next: (datos) => {
        this.peliculas = datos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar películas:', error);
      },
    });
  }

  // =====================================
  // OBTENER TÍTULO DE PELÍCULA
  // =====================================

  obtenerTitulo(peliculaId: number): string {
    const pelicula = this.peliculas.find(
      (p) => Number(p.id) === Number(peliculaId)
    );

    return pelicula ? pelicula.titulo : 'Película no encontrada';
  }

  // =====================================
  // OBTENER FUNCIÓN
  // =====================================

  obtenerFuncion(id: number): Funcion | undefined {
    return this.funciones.find(
      (f) => Number(f.id) === Number(id)
    );
  }

  // =====================================
  // FORMATEAR HORA
  // =====================================

  formatearHora(hora: string): string {
    if (!hora) {
      return '';
    }

    const partes = hora.split(':');
    const horas = Number(partes[0]);
    const minutos = partes[1] || '00';

    if (Number.isNaN(horas) || horas < 0 || horas > 23) {
      return hora;
    }

    const periodo = horas >= 12 ? 'PM' : 'AM';
    const hora12 = horas % 12 || 12;

    return `${String(hora12).padStart(2, '0')}:${minutos} ${periodo}`;
  }

  // =====================================
  // FORMATEAR FECHA
  // =====================================

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return fecha;
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(fechaConvertida);
  }

  // =====================================
  // CALCULAR TOTAL DE COMPRA
  // =====================================

  calcularTotal(): number {
    const funcion = this.obtenerFuncion(this.nuevaCompra.funcionId);

    if (!funcion) {
      return 0;
    }

    const cantidad = Number(this.nuevaCompra.cantidadBoletos) || 0;

    return funcion.precio * cantidad;
  }

  // =====================================
  // SELECCIONAR MÉTODO DE PAGO
  // =====================================

  seleccionarMetodoPago(metodo: string): void {
    this.nuevaCompra.metodoPago = metodo;
    this.nuevaCompra.codigoPago = '';

    this.tarjetaCineVerse = null;

    this.consultandoTarjeta = false;
    this.recargando = false;

    this.mensajeRecarga = '';
    this.errorRecarga = '';
    this.errorTarjeta = '';
  }

  // =====================================
  // CONSULTAR CINEVERSE CARD
  // =====================================

  consultarTarjeta(): void {
    const numero = this.nuevaCompra.codigoPago?.trim();

    this.tarjetaCineVerse = null;
    this.mensajeRecarga = '';
    this.errorRecarga = '';
    this.errorTarjeta = '';

    if (!numero) {
      this.errorTarjeta = 'Ingresa el número de tu CineVerse Card.';
      return;
    }

    if (this.consultandoTarjeta) {
      return;
    }

    this.consultandoTarjeta = true;

    this.cineVerseCardService.consultarPorNumero(numero).subscribe({
      next: (tarjeta) => {
        this.tarjetaCineVerse = tarjeta;

        this.consultandoTarjeta = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al consultar la tarjeta:', error);

        this.errorTarjeta =
          'No se encontró una CineVerse Card con ese número.';

        this.consultandoTarjeta = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =====================================
  // FORMATEAR VALOR DE RECARGA
  // =====================================

  actualizarValorRecarga(valor: string): void {

    // Permitir únicamente números
    const numeros = valor.replace(/\D/g, '');

    if (!numeros) {
      this.valorRecarga = 0;
      this.valorRecargaTexto = '';
      return;
    }

    // Convertir el texto a número
    this.valorRecarga = Number(numeros);

    // Mostrar separadores de miles colombianos
    this.valorRecargaTexto = this.valorRecarga.toLocaleString('es-CO');
  }

  // =====================================
  // RECARGAR SALDO DE CINEVERSE CARD
  // =====================================

  recargarSaldo(): void {

    this.mensajeRecarga = '';
    this.errorRecarga = '';

    if (!this.tarjetaCineVerse) {
      this.errorRecarga = 'Primero consulta una tarjeta válida.';
      return;
    }

    if (
      !Number.isFinite(this.valorRecarga) ||
      this.valorRecarga <= 0
    ) {
      this.errorRecarga = 'Escribe un valor de recarga válido.';
      return;
    }

    if (this.recargando) {
      return;
    }

    this.recargando = true;

    this.cineVerseCardService
      .recargarSaldo(
        this.tarjetaCineVerse.id,
        this.valorRecarga
      )
      .subscribe({

        next: (tarjetaActualizada) => {

          // Actualizar información de la tarjeta
          this.tarjetaCineVerse = tarjetaActualizada;

          this.mensajeRecarga = '¡Saldo agregado correctamente!';

          // Restaurar valor inicial
          this.valorRecarga = 10000;
          this.valorRecargaTexto = '10.000';

          this.recargando = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Error al recargar saldo:', error);

          this.errorRecarga =
            typeof error.error === 'string'
              ? error.error
              : 'No fue posible agregar el saldo.';

          this.recargando = false;

          this.cdr.detectChanges();
        },

      });
  }

  // =====================================
  // REALIZAR COMPRA
  // =====================================

  realizarCompra(): void {

    this.mensaje = '';
    this.error = '';
    this.comprobante = null;

    if (
      !this.nuevaCompra.funcionId ||
      !this.nuevaCompra.nombreCliente.trim() ||
      this.nuevaCompra.cantidadBoletos < 1
    ) {
      this.error = 'Completa todos los campos correctamente.';
      return;
    }

    if (!this.nuevaCompra.metodoPago) {
      this.error = 'Selecciona un método de pago.';
      return;
    }

    if (
      this.nuevaCompra.metodoPago === 'CINEVERSE_CARD' &&
      !this.nuevaCompra.codigoPago?.trim()
    ) {
      this.error = 'Ingresa el número de tu CineVerse Card.';
      return;
    }

    const funcion = this.obtenerFuncion(this.nuevaCompra.funcionId);

    if (!funcion) {
      this.error = 'Selecciona una función válida.';
      return;
    }

    if (this.nuevaCompra.cantidadBoletos > funcion.cuposDisponibles) {
      this.error = 'No hay suficientes cupos disponibles.';
      return;
    }

    this.guardando = true;

    console.log('Compra que se envía:', this.nuevaCompra);

    this.compraService.crear(this.nuevaCompra).subscribe({

      next: (compra) => {

        this.mensaje =
          'Compra registrada correctamente. Total: ' +
          new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }).format(compra.valorTotal || 0);

        // =====================================
        // CONSULTAR COMPROBANTE
        // =====================================

        if (compra.id) {

          this.compraService.obtenerComprobante(compra.id).subscribe({

            next: (recibo) => {
              this.comprobante = recibo;
              this.cdr.detectChanges();
            },

            error: (error) => {
              console.error('Error al obtener el comprobante:', error);

              this.error =
                'La compra se registró, pero no se pudo cargar el comprobante.';

              this.cdr.detectChanges();
            },

          });

        } else {

          this.error =
            'La compra se registró, pero no se recibió su identificador.';

        }

        // =====================================
        // LIMPIAR FORMULARIO
        // =====================================

        this.nuevaCompra = {
          funcionId: 0,
          nombreCliente: '',
          cantidadBoletos: 1,
          metodoPago: '',
          codigoPago: '',
        };

        this.tarjetaCineVerse = null;

        this.mensajeRecarga = '';
        this.errorRecarga = '';
        this.errorTarjeta = '';

        // =====================================
        // ACTUALIZAR INFORMACIÓN
        // =====================================

        this.cargarCompras();
        this.cargarFunciones();

        this.guardando = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Error al registrar la compra:', error);

        this.error =
          typeof error.error === 'string'
            ? error.error
            : 'No fue posible registrar la compra.';

        this.guardando = false;

        this.cdr.detectChanges();
      },

    });
  }

  // =====================================
  // IMPRIMIR COMPROBANTE
  // =====================================

  imprimirComprobante(): void {
    window.print();
  }

}
