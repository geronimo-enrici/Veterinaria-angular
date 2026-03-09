import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backend-hmz6.onrender.com/api/Auth/login'; 

  constructor(private http: HttpClient) {}

  login(credenciales: any) {
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          
          if(response.rol) {
             localStorage.setItem('rol', response.rol);
          }
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }
}