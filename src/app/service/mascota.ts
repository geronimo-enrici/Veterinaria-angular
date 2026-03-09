import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private apiUrl = 'https://backend-hmz6.onrender.com/api/mascotas'; 

  constructor(private http: HttpClient) { }

  getMascotas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addMascota(mascota: any): Observable<any> {
    return this.http.post(this.apiUrl, mascota);
  }

  getMascotaById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getDescripcionIA(nombre: string, raza: string): Observable<any> {
    const url = `https://localhost:7082/api/mascotas/generar-descripcion`;
    return this.http.get(`${url}?nombre=${nombre}&raza=${raza}`);
  }
updateMascota(id: number, mascota: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, mascota);
}
actualizarVacuna(idMascota: number, idVacuna: number, datos: any): Observable<any> {
 
  return this.http.put(`${this.apiUrl}/${idMascota}/vacunas/${idVacuna}`, datos);
}
getDuenoDetalle(id: number): Observable<any> {
  return this.http.get(`https://localhost:7082/api/Duenos/${id}`);
}
getHistorial(mascotaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/HistorialClinico/mascota/${mascotaId}`);
  }

  postHistorial(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/HistorialClinico`, datos);
  }
}