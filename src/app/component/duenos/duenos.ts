import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DuenosService } from '../../service/duenos'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-duenos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './duenos.html',
  styleUrls: ['./duenos.css']
})
export class Duenos implements OnInit {
  duenos: any[] = [];
  nuevoDueno: any = { nombre: '', apellido: '', telefono: '' };
  currentPage: number = 1;
  itemsPerPage: number = 6;


  constructor(
    private duenosService: DuenosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerDuenos();
  }

  obtenerDuenos() {
    this.duenosService.getDuenos().subscribe({
      next: (data: any) => {
        this.duenos = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error al obtener dueños:', e)
    });
  }

  get paginatedDuenos() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.duenos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.duenos.length / this.itemsPerPage);
  }

  guardarDueno() {
    if (!this.nuevoDueno.nombre || !this.nuevoDueno.apellido) {
      alert("El nombre y el apellido son obligatorios");
      return;
    }

    this.duenosService.addDueno(this.nuevoDueno).subscribe({
      next: () => {
        this.obtenerDuenos();
        this.nuevoDueno = { nombre: '', apellido: '', telefono: '' }; // Limpiamos el formulario
      },
      error: (e) => console.error('Error al guardar dueño:', e)
    });
  }
}