import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMascotaComponent } from './detalle-mascota';

describe('DetalleMascotaComponent', () => {
  let component: DetalleMascotaComponent;
  let fixture: ComponentFixture<DetalleMascotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMascotaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMascotaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
