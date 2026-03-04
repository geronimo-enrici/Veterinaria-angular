import { Routes } from '@angular/router';
import { Mascotas } from './component/mascotas/mascotas';
import { DetalleMascotaComponent } from './component/detalle-mascota/detalle-mascota';
import { Duenos } from './component/duenos/duenos';
import { DetallePersona } from './component/detalle-persona/detalle-persona';
import { Productos } from './component/productos/productos';
import { CalendarioTurnos } from './component/calendario-turnos/calendario-turnos';
import { LoginComponent } from './component/login/login';
import { authGuard } from './auth/guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: Mascotas },
      { path: 'duenos', component: Duenos },
      { path: 'duenos/:id', component: DetallePersona },
      { path: 'detalle/:id', component: DetalleMascotaComponent },
      { path: 'productos', component: Productos },
      { path: 'turnos', component: CalendarioTurnos },
    ]
  },

  { path: '**', redirectTo: '' }
];