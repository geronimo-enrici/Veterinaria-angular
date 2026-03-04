import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioTurnos } from './calendario-turnos';

describe('CalendarioTurnos', () => {
  let component: CalendarioTurnos;
  let fixture: ComponentFixture<CalendarioTurnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioTurnos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioTurnos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
