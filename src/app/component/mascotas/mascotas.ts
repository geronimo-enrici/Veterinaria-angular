import { Component, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MascotasService } from '../../service/mascota';
import { DuenosService } from '../../service/duenos'; 

@Component({
  selector: 'app-lista-mascotas',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './mascotas.html',
  styleUrls: ['./mascotas.css']
})
export class Mascotas {
  mascotas: any[] = [];
  duenos: any[] = []; 
  currentPage: number = 1;
  itemsPerPage: number = 8;
  searchTerm: string = '';

  nuevaMascota: any = { nombre: '', raza: '', edad: null, peso: null, duenoId: null };

  constructor(
    private mascotasService: MascotasService,
    private duenosService: DuenosService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    afterNextRender(() => {
      this.obtenerMascotas();
      this.obtenerDuenos(); 
    });
  }

  get filteredMascotas() {
    if (!this.searchTerm) return this.mascotas;
    
    const term = this.searchTerm.toLowerCase();
    return this.mascotas.filter(m => 
      m.nombre.toLowerCase().includes(term) ||
      m.raza.toLowerCase().includes(term) ||
      (m.dueno && m.dueno.nombre.toLowerCase().includes(term))
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredMascotas.length / this.itemsPerPage) || 1;
  }

  get paginatedMascotas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const currentItems = this.filteredMascotas.slice(startIndex, startIndex + this.itemsPerPage);
    const placeholdersNeeded = this.itemsPerPage - currentItems.length;
    const placeholders = Array(placeholdersNeeded).fill({ isPlaceholder: true });

    return [...currentItems, ...placeholders];
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  obtenerMascotas() {
    this.mascotasService.getMascotas().subscribe({
      next: (data: any) => {
        this.mascotas = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error:', e)
    });
  }

  obtenerDuenos() {
    this.duenosService.getDuenos().subscribe({
      next: (data: any) => {
        this.duenos = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error:', e)
    });
  }

  guardarMascota() {
    if (!this.nuevaMascota.duenoId) {
      alert("Por favor, selecciona un dueño");
      return;
    }

    this.mascotasService.addMascota(this.nuevaMascota).subscribe({
      next: () => {
        this.obtenerMascotas();
        this.nuevaMascota = { nombre: '', raza: '', edad: null, peso: null, duenoId: null };
      },
      error: (e) => console.error('Error:', e)
    });
  }

  irAlDetalle(id: number) {
    this.router.navigate(['/detalle', id]);
  }
  
  irADuenos() {
    this.router.navigate(['/duenos']);
  }
}