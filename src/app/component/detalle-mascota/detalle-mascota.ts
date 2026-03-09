import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MascotasService } from '../../service/mascota';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detalle-mascota',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detalle-mascota.html',
  styleUrls: ['./detalle-mascota.css']
})
export class DetalleMascotaComponent implements OnInit {
  mascota: any = null;
  descripcionIA: string = '';
  cargandoIA: boolean = false;
  loading: boolean = true; 
  apiUrl = 'https://backend-hmz6.onrender.com/api/Mascotas';
  plan: any[] = [];
  editando: boolean = false;
  cargandoGuardar: boolean = false;
  vacunaEditando: any = null; 
  guardandoVacuna: boolean = false;
  proximosTurnos: any[] = [];

  historial: any[] = [];
  mostrarModalHistorial: boolean = false;
  nuevoRegistro = {
    fecha: new Date().toISOString().split('T')[0],
    veterinario: '',
    motivoConsulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
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
      if (data.mascota) {
        this.mascota = data.mascota;
        this.plan = data.planVacunacion || [];
      } else {
        this.mascota = data;
        this.plan = data.vacunas || [];
      }
      this.loading = false; 
      if (this.mascota && this.mascota.nombre) {
        this.generarBio();
        this.cargarTurnos();
        this.cargarHistorial(id);
      }
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
cargarTurnos() {
  this.http.get<any[]>('https://backend-hmz6.onrender.com/api/turnos').subscribe({
    next: (data) => {
      const ahora = new Date();
      this.proximosTurnos = data
        .filter(t => t.mascotaNombre === this.mascota.nombre && new Date(t.fechaHora) >= ahora)
        .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
        .slice(0, 4);
      
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Error al cargar turnos", err)
  });
}
  generarBio() {
    this.cargandoIA = true;
    this.service.getDescripcionIA(this.mascota.nombre, this.mascota.raza).subscribe({
      next: (resp: any) => {
        const texto = resp?.candidates?.[0]?.content?.parts?.[0]?.text;
        this.descripcionIA = texto || "Biografía no disponible.";
        this.cargandoIA = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoIA = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarCambios() {
    if (!this.mascota) return;
    this.cargandoGuardar = true;
    this.service.updateMascota(this.mascota.id, this.mascota).subscribe({
      next: () => {
        this.cargandoGuardar = false;
        this.editando = false;
        this.generarBio(); 
      },
      error: () => {
        this.cargandoGuardar = false;
      }
    });
  }

  toggleEdit() {
    this.editando = !this.editando;
    if (!this.editando) {
      this.obtenerDatosMascota(this.mascota.id);
    }
  }

  iniciarEdicionVacuna(vacuna: any) {
    this.vacunaEditando = { ...vacuna };
    if (this.vacunaEditando.fecha) {
      this.vacunaEditando.fecha = new Date(this.vacunaEditando.fecha).toISOString().split('T')[0];
    }
  }

  cancelarEdicionVacuna() {
    this.vacunaEditando = null;
  }

  guardarVacuna() {
    if (!this.vacunaEditando || !this.mascota) return;
    this.guardandoVacuna = true;
    this.service.actualizarVacuna(this.mascota.id, this.vacunaEditando.vacunaId, this.vacunaEditando)
    .subscribe({
      next: () => {
        const index = this.plan.findIndex(v => v.vacunaId === this.vacunaEditando.vacunaId);
        if (index !== -1) {
          this.plan[index].aplicada = this.vacunaEditando.aplicada;
          this.plan[index].fecha = this.vacunaEditando.fecha;
        }
        this.vacunaEditando = null; 
        this.guardandoVacuna = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoVacuna = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarHistorial(id: number) {
    this.service.getHistorial(id).subscribe({
      next: (data) => {
        this.historial = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar historial", err)
    });
  }

  abrirModalNuevoRegistro() {
    this.mostrarModalHistorial = true;
  }

  cerrarModalRegistro() {
    this.mostrarModalHistorial = false;
    this.nuevoRegistro = { fecha: new Date().toISOString().split('T')[0], veterinario: '', motivoConsulta: '', diagnostico: '', tratamiento: '', observaciones: '' };
  }

  guardarRegistro() {
    if (!this.mascota) return;
    
    this.service.agregarHistorial(this.mascota.id, this.nuevoRegistro).subscribe({
      next: (res) => {
        this.historial.unshift(res); 
        this.cerrarModalRegistro();
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al guardar el registro médico", err)
    });
  }
}