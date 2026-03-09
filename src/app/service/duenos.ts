import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DuenosService {
  private apiUrl = 'https://backend-hmz6.onrender.com/api/duenos'; 

  constructor(private http: HttpClient) { }

  getDuenos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addDueno(dueno: any): Observable<any> {
    return this.http.post(this.apiUrl, dueno);
  }
}