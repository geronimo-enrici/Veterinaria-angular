import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Header, Footer, FullCalendarModule],
  templateUrl: './app.html'
})
export class App {
 }