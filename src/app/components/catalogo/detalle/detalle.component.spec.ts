import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleComponent } from './detalle.component';
import { ActivatedRoute, Router } from '@angular/router';
import { JuegoService } from '../../../services/JuegoService/juego-service';
import { CarritoService } from '../../../services/CarritoService/carrito-service';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Swal from 'sweetalert2';

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;

  // Mocks de enrutamiento
  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn()
      }
    }
  };

  // Mocks de servicios
  const mockJuegoService = {
    juegos: signal([
      { id: 1, nombre: 'Aventureros al Tren', stock: 3, precio: 45000 }
    ]),
    reducirStock: vi.fn()
  };

  const mockCarritoService = {
    agregar: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DetalleComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: JuegoService, useValue: mockJuegoService },
        { provide: CarritoService, useValue: mockCarritoService }
      ]
    }).compileComponents();

    /*
    * Se debe configurar la URL (el ActivatedRoute) en cada prueba individualmente antes de que nazca el componente.
    */
    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;
  });

  it('Deberia cargar el juego correctamente si el ID de la URL existe', () => {
    // Arrange: Simular que la URL dice "/detalle/1"
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
    
    // Act: Ejecutar el ciclo de vida inicial
    fixture.detectChanges();

    // Assert
    expect(component.juegoActual()?.nombre).toBe('Aventureros al Tren');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('Deberia redirigir al catalogo si el ID de la URL no existe en el inventario', () => {
    // Arrange: Simular un ID falso
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('999');
    
    // Act
    fixture.detectChanges();

    // Assert
    expect(component.juegoActual()).toBeUndefined();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
  });

  it('Deberia incrementar la cantidad respetando el limite maximo de stock', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
    // El stock limite es 3
    fixture.detectChanges();

    // Incremento inicial (1 -> 2)
    component.incrementar();
    expect(component.cantidadSeleccionada()).toBe(2);

    // Segundo incremento (2 -> 3)
    component.incrementar();
    expect(component.cantidadSeleccionada()).toBe(3);

    // Intento de sobrepasar el stock (3 -> 4). La función deberia bloquearlo.
    component.incrementar();
    expect(component.cantidadSeleccionada()).toBe(3); 
  });

  it('Deberia decrementar la cantidad sin bajar de 1', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
    fixture.detectChanges();

    // Arrange: Forzar la señal a 2
    component.cantidadSeleccionada.set(2);
    
    // Act & Assert: Bajar a 1
    component.decrementar();
    expect(component.cantidadSeleccionada()).toBe(1);

    // Intentar bajar a 0. La funcion debe bloquearlo.
    component.decrementar(); 
    expect(component.cantidadSeleccionada()).toBe(1);
  });

  it('Deberia ejecutar el bucle de compra, reducir stock, limpiar variables y lanzar Swal', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
    fixture.detectChanges();

    // Arrange: Interceptar la alerta y configurar una compra de 2 unidades
    const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({} as any);
    component.cantidadSeleccionada.set(2);

    // Act
    component.agregarMultiplesAlCarrito();

    // Assert 1: Se debio llamar a los servicios 2 veces (por el bucle for)
    expect(mockJuegoService.reducirStock).toHaveBeenCalledTimes(2);
    // Con el ID 1
    expect(mockJuegoService.reducirStock).toHaveBeenCalledWith(1);
    expect(mockCarritoService.agregar).toHaveBeenCalledTimes(2);

    // Assert 2: Verificar que la vista local se haya restado (de 3 a 1)
    expect(component.juegoActual()?.stock).toBe(1);

    // Assert 3: El contador numerico debio volver a 1
    expect(component.cantidadSeleccionada()).toBe(1);

    // Assert 4: La alerta de exito debio dispararse
    expect(swalSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: '¡Agregado!',
      icon: 'success'
    }));
  });
});