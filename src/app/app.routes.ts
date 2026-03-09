import { Routes } from '@angular/router';
import { Mascotas } from './component/mascotas/mascotas';
import { DetalleMascotaComponent } from './component/detalle-mascota/detalle-mascota';
import path from 'path';
import { Duenos } from './component/duenos/duenos';
import { DetallePersona } from './component/detalle-persona/detalle-persona';
import { Productos } from './component/productos/productos';
import { CalendarioTurnos } from './component/calendario-turnos/calendario-turnos';
import { authGuard } from './auth/guard';
import { Login } from './component/login/login';  

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'mascotas', component: Mascotas, canActivate: [authGuard] },
  { path: 'duenos/:id', component: DetallePersona, canActivate: [authGuard] },
  { path : 'duenos', component: Duenos, canActivate: [authGuard] },
  { path: 'detalle/:id', component: DetalleMascotaComponent, canActivate: [authGuard] },
  { path: 'productos', component: Productos, canActivate: [authGuard] },
  { path: 'turnos', component: CalendarioTurnos, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];