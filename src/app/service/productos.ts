import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'https://backend-hmz6.onrender.com/api/Productos';

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  sincronizarExcel(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo); 
    return this.http.post(`${this.apiUrl}/sincronizar-excel`, formData);
  }
  descargarExcel(): Observable<Blob> {
    const token = localStorage.getItem('token');
  
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get('https://localhost:7082/api/Productos/descargar-excel', { 
      headers: headers,
      responseType: 'blob' 
    });
  }
}