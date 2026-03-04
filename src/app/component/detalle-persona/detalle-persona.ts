import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MascotasService } from '../../service/mascota';
import { RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-persona',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './detalle-persona.html',
  styleUrls: ['./detalle-persona.css']
})
export class DetallePersona implements OnInit {
  dueno: any = null;
  mascotas: any[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private mascotasService: MascotasService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatosDueno(Number(id));
    }
  }

  cargarDatosDueno(id: number) {
    this.mascotasService.getDuenoDetalle(id).subscribe({
      next: (data: any) => {
        // Usamos setTimeout para sacar la actualización del hilo de la petición
        setTimeout(() => {
          if (data) {
            this.dueno = {
              nombre: data.nombre || data.Nombre,
              apellido: data.apellido || data.Apellido,
              telefono: data.telefono || data.Telefono
            };

            const rawMascotas = data.mascotas || data.Mascotas || [];
            this.mascotas = rawMascotas.map((m: any) => ({
              id: m.id || m.Id,
              nombre: m.nombre || m.Nombre,
              raza: m.raza || m.Raza,
              edad: m.edad || m.Edad,
              peso: m.peso || m.Peso
            }));
          }
          this.cargando = false;
          this.cdr.detectChanges(); // Forzamos el renderizado
        }, 0);
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}