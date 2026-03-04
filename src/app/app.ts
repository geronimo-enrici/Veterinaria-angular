import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Header, Footer, FullCalendarModule, CommonModule],
  templateUrl: './app.html'
})
export class App {
  constructor(public router: Router) {}
}