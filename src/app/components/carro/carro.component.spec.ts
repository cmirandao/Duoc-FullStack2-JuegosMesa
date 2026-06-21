import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarroComponent } from './carro.component';
import { CarritoService } from '../../services/CarritoService/carrito-service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CarroComponent', () => {
  let component: CarroComponent;
  let fixture: ComponentFixture<CarroComponent>;
  // Mocks de Signals para simular el estado de la aplicación
  const mockRouter = { navigate: vi.fn() };
  const mockCarritoService = {
    procesarPago: vi.fn(),
    itemsAgrupados: signal([]),
    items: signal([]),
    total: 0
  };

  beforeEach(async () => {
    // Limpieza de mocks antes de cada prueba
    vi.clearAllMocks();
    // Vitest que toma el control del tiempo antes de montar el componente
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [CarroComponent],
      providers: [
        { provide: CarritoService, useValue: mockCarritoService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  afterEach(() => {
    // Restaurar el reloj al terminar cada prueba
    vi.useRealTimers();
  });

  it('Deberia crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia mostrar alerta de error y limpiarlo despues de 3 segundos', () => {
    mockCarritoService.procesarPago.mockReturnValue({ 
      exito: false, 
      mensaje: 'Tu carrito está vacío.', 
      tipo: 'warning' 
    });

    component.pagar();

    expect(component.alertaPago()).toEqual({ tipo: 'danger', mensaje: 'Tu carrito está vacío.' });

    // Reemplazo tick(3000) de Angular por el avance nativo de Vitest
    vi.advanceTimersByTime(3000);

    expect(component.alertaPago()).toBeNull();
  });

  it('Deberia mostrar alerta de exito y navegar despues de 2.5 segundos', () => {
    mockCarritoService.procesarPago.mockReturnValue({ 
      exito: true, 
      mensaje: '¡Compra procesada con éxito!', 
      tipo: 'success' 
    });

    component.pagar();

    expect(component.alertaPago()).toEqual({ tipo: 'success', mensaje: '¡Compra procesada con éxito!' });
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    // Reemplazo tick(2500)
    vi.advanceTimersByTime(2500);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});