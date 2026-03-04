import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { TurnosService, Turno } from '../../service/turnos';

@Component({
  selector: 'app-calendario-turnos',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './calendario-turnos.html',
  styleUrls: ['./calendario-turnos.css']
})
export class CalendarioTurnos implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  mascotasBD: any[] = [];
  
  turnoForm = {
    mascotaNombre: '',
    fechaHora: '',
    tipo: 'Veterinaria'
  };

  turnoSeleccionado: any = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    expandRows: true,
    selectable: true,
    selectMirror: true,
    unselectAuto: false,
    nowIndicator: true,
    slotEventOverlap: false,
    events: [],
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private turnosService: TurnosService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMascotas();
    this.cargarTurnos();
  }

  cargarMascotas(): void {
    this.http.get<any[]>('https://localhost:7082/api/mascotas').subscribe({
      next: (data) => {
        this.mascotasBD = data;
        this.cdr.detectChanges();
      }
    });
  }

cargarTurnos() {
    this.http.get<any[]>('https://localhost:7082/api/turnos').subscribe(data => {
      
      const configTipos: { [key: string]: { duracionMs: number, color: string } } = {
        'Veterinaria': { duracionMs: 3600000, color: '#3788d8' }, 
        'Peluqueria':  { duracionMs: 7200000, color: '#ff9f89' }, 
        'Vacunacion':  { duracionMs: 1800000, color: '#28a745' },
        'Cirugia':     { duracionMs: 10800000, color: '#dc3545'},
        'Chequeo':     { duracionMs: 1800000, color: '#6f42c1' } 
      };

      this.calendarOptions.events = data.map(t => {
        const config = configTipos[t.tipo] || configTipos['Veterinaria'];
        
        return {
          id: String(t.id),
          title: t.mascotaNombre,
          start: t.fechaHora,
          end: new Date(new Date(t.fechaHora).getTime() + config.duracionMs).toISOString(),
          backgroundColor: config.color,
          extendedProps: { tipo: t.tipo, mascotaNombre: t.mascotaNombre }
        };
      });
      
      this.cdr.detectChanges();
    });
  }

  handleSelect(selectionInfo: any): void {
    this.turnoSeleccionado = null;
    const date = selectionInfo.start;
    const offset = date.getTimezoneOffset() * 60000;
    const localIso = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    this.turnoForm.fechaHora = localIso;
    this.cdr.detectChanges();
  }

  handleEventClick(clickInfo: any): void {
    this.turnoForm.fechaHora = '';
    if (this.calendarComponent) {
      this.calendarComponent.getApi().unselect();
    }
    
    this.turnoSeleccionado = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      tipo: clickInfo.event.extendedProps.tipo,
      mascotaNombre: clickInfo.event.extendedProps.mascotaNombre
    };
    this.cdr.detectChanges();
  }

  guardarTurno(): void {
    if (!this.turnoForm.mascotaNombre || !this.turnoForm.fechaHora) {
      return;
    }

    const nuevoTurno: Turno = {
      mascotaNombre: this.turnoForm.mascotaNombre,
      fechaHora: this.turnoForm.fechaHora,
      tipo: this.turnoForm.tipo
    };

    this.turnosService.crearTurno(nuevoTurno).subscribe({
      next: () => {
        this.turnoForm.mascotaNombre = '';
        this.turnoForm.fechaHora = '';
        this.turnoForm.tipo = 'Veterinaria';
        
        if (this.calendarComponent) {
          this.calendarComponent.getApi().unselect();
        }

        this.cargarTurnos();
      }
    });
  }

  eliminarTurno(): void {
    if (!this.turnoSeleccionado) return;

    this.http.delete(`https://localhost:7082/api/turnos/${this.turnoSeleccionado.id}`).subscribe({
      next: () => {
        this.turnoSeleccionado = null;
        this.cargarTurnos();
      }
    });
  }
}