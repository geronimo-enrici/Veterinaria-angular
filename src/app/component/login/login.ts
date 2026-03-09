import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  credenciales = { email: '', password: '' };
  mensajeError = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        this.router.navigate(['/mascotas']); 
      },
      error: (err) => {
        this.mensajeError = 'Credenciales incorrectas. Intenta de nuevo.';
        console.error(err);
      }
    });
  }
}