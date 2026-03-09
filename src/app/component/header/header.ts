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
  menuAbierto = false; 

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.verificarSesion();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.menuAbierto ? 'hidden' : 'auto';
    }
    if (this.menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  verificarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      this.estaLogueado = !!localStorage.getItem('token');
      this.esAdmin = localStorage.getItem('rol') === 'Admin';
    }
  }

  abrirLogin() {
    if (isPlatformBrowser(this.platformId)) {
      window.dispatchEvent(new CustomEvent('abrir-login'));
      if (this.menuAbierto) this.toggleMenu(); 
    }
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      window.location.reload();
    }
  }
}