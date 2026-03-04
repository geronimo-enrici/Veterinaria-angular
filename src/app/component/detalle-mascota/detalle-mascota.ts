import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MascotasService } from '../../service/mascota';

@Component({
  selector: 'app-detalle-mascota',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detalle-mascota.html',
  styleUrls: ['./detalle-mascota.css']
})
export class DetalleMascotaComponent implements OnInit {
  mascota: any = null;
  loading: boolean = true;
  editando: boolean = false;
  cargandoGuardar: boolean = false;
  plan: any[] = [];
  proximosTurnos: any[] = [];
  historialClinico: any[] = [];

  nuevaConsulta = {
    mascotaId: 0,
    motivo: '',
    peso: 0,
    diagnostico: '',
    tratamiento: '',
    veterinario: 'Personal Médico'
  };

  constructor(
    private route: ActivatedRoute,
    private service: MascotasService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.obtenerDatosMascota(Number(id));
      }
    });
  }

  obtenerDatosMascota(id: number) {
    this.loading = true;
    this.service.getMascotaById(id).subscribe({
      next: (data: any) => {
        this.mascota = data.mascota || data;
        this.plan = data.planVacunacion || data.vacunas || [];
        this.nuevaConsulta.peso = this.mascota.peso;
        this.nuevaConsulta.mascotaId = this.mascota.id;
        
        this.cargarHistorial(this.mascota.id);
        
        if (this.mascota?.nombre) {
          this.cargarTurnos();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarHistorial(id: number) {
    this.http.get<any[]>(`https://localhost:7082/api/HistorialClinico/mascota/${id}`).subscribe({
      next: (data) => {
        this.historialClinico = data;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTurnos() {
    this.http.get<any[]>('https://localhost:7082/api/turnos').subscribe({
      next: (data) => {
        const ahora = new Date();
        this.proximosTurnos = data
          .filter(t => t.mascotaNombre === this.mascota.nombre && new Date(t.fechaHora) >= ahora)
          .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
          .slice(0, 3);
        this.cdr.detectChanges();
      }
    });
  }

  registrarConsulta() {
    if (!this.nuevaConsulta.motivo || !this.nuevaConsulta.diagnostico) return;
    
    this.http.post('https://localhost:7082/api/HistorialClinico', this.nuevaConsulta).subscribe({
      next: (nuevoRegistro: any) => {
        this.historialClinico.unshift(nuevoRegistro);
        this.mascota.peso = this.nuevaConsulta.peso;
        
        this.nuevaConsulta = {
          mascotaId: this.mascota.id,
          motivo: '',
          peso: this.mascota.peso,
          diagnostico: '',
          tratamiento: '',
          veterinario: 'Personal Médico'
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al guardar historial", err)
    });
  }

  toggleEdit() {
    this.editando = !this.editando;
    if (!this.editando) this.obtenerDatosMascota(this.mascota.id);
  }

  guardarCambios() {
    if (!this.mascota) return;
    this.cargandoGuardar = true;
    this.service.updateMascota(this.mascota.id, this.mascota).subscribe({
      next: () => {
        this.cargandoGuardar = false;
        this.editando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoGuardar = false;
        this.cdr.detectChanges();
      }
    });
  }
}