import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  estaLogueado = false;
  esAdmin = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    console.log('[Header] Inicializando componente');
    this.verificarSesion();
  }

  verificarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      this.estaLogueado = !!localStorage.getItem('token');
      this.esAdmin = localStorage.getItem('rol') === 'Admin';
      console.log('[Header] Estado de sesión:', { logueado: this.estaLogueado, admin: this.esAdmin });
    }
  }

  abrirLogin() {
    console.log('[Header] Emitiendo evento "abrir-login"');
    if (isPlatformBrowser(this.platformId)) {
      window.dispatchEvent(new CustomEvent('abrir-login'));
    }
  }

  cerrarSesion() {
    console.log('[Header] Cerrando sesión y limpiando localStorage');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      window.location.reload();
    }
  }
}