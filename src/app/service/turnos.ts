import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turno {
  id?: number;
  mascotaNombre: string;
  fechaHora: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private apiUrl = 'https://localhost:7082/api/turnos'

  constructor(private http: HttpClient) { }

  getTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.apiUrl);
  }

  crearTurno(turno: Turno): Observable<Turno> {
    return this.http.post<Turno>(this.apiUrl, turno);
  }
}