import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarroComponent } from './carro.component';

describe('Carro', () => {
  let component: CarroComponent;
  let fixture: ComponentFixture<CarroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
