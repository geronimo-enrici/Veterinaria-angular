import { Routes } from '@angular/router';
import { Mascotas } from './component/mascotas/mascotas';
import { DetalleMascotaComponent } from './component/detalle-mascota/detalle-mascota';
import path from 'path';
import { Duenos } from './component/duenos/duenos';
import { DetallePersona } from './component/detalle-persona/detalle-persona';
import { Productos } from './component/productos/productos';
import { CalendarioTurnos } from './component/calendario-turnos/calendario-turnos';

export const routes: Routes = [
  { path: '', component: Mascotas },
  { path: 'duenos/:id', component: DetallePersona },
  { path : 'duenos', component: Duenos },
  { path: 'detalle/:id', component: DetalleMascotaComponent },
  { path: 'productos', component: Productos },
  { path: 'turnos', component: CalendarioTurnos },
  { path: '**', redirectTo: '' },
];