import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  estaLogueado = false;
  esAdmin = false;
  mostrarModalLogin = false;
  loginEmail = '';
  loginPassword = '';
  errorLogin = false;
  cargandoLogin = false;
  
  private apiUrl = 'https://localhost:7082/api';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.verificarSesion();
  }

  verificarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      this.estaLogueado = !!localStorage.getItem('token');
      this.esAdmin = localStorage.getItem('rol') === 'Admin';
    }
  }

  abrirLogin() {
    this.router.navigate(['/login']);
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      window.location.reload();
    }
  }

  iniciarSesion() {
    this.cargandoLogin = true;
    this.errorLogin = false;

    this.http.post<any>(`${this.apiUrl}/Auth/login`, {
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        window.location.reload();
      },
      error: () => {
        this.zone.run(() => {
          this.errorLogin = true;
          this.cargandoLogin = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
}