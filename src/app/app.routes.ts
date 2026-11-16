import { Routes } from '@angular/router';
import { Peliculas } from './peliculas/peliculas';
import { Funciones } from './funciones/funciones';
import { Compras } from './compras/compras';
import { Historial } from './historial/historial';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'peliculas',
    pathMatch: 'full',
  },
  {
    path: 'peliculas',
    component: Peliculas,
  },
  {
    path: 'funciones',
    component: Funciones,
  },
  {
    path: 'compras',
    component: Compras,
  },
  {
    path: 'historial',
    component: Historial,
  },
];
