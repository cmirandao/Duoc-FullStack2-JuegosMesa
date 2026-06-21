import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoComponent } from './catalogo.component';
import { JuegoService } from '../../services/JuegoService/juego-service';
import { AuthService } from '../../services/AuthService/auth-service';
import { CarritoService } from '../../services/CarritoService/carrito-service';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Juego } from '../../models/juego.model';
import { ActivatedRoute } from '@angular/router';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;

  // Datos de prueba
  const juegosMock: Partial<Juego>[] = [
    { id: 1, nombre: 'Juego Estrategia 1', categoria: 'Estrategia', stock: 5 },
    { id: 2, nombre: 'Juego Estrategia 2', categoria: 'Estrategia', stock: 0 },
    { id: 3, nombre: 'Juego Familiar 1', categoria: 'Familiar', stock: 10 }
  ];

  // Mocks de los Servicios
  const mockJuegoService = {
    juegos: signal(juegosMock),
    reducirStock: vi.fn()
  };

  const mockCarritoService = {
    agregar: vi.fn()
  };

  const mockAuthService = {
    esAdmin: vi.fn().mockReturnValue(false) 
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Vitest que toma el control del tiempo antes de montar el componente
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [CatalogoComponent],
      providers: [
        { provide: JuegoService, useValue: mockJuegoService },
        { provide: CarritoService, useValue: mockCarritoService },
        { provide: AuthService, useValue: mockAuthService },
        // Previene el error NG0201 inyectando una ruta falsa para los RouterLinks del HTML
        { provide: ActivatedRoute, useValue: {} } 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restaurar el reloj al terminar cada prueba
    vi.useRealTimers();
  });

  it('Deberia crearse y extraer las categorías unicas correctamente', () => {
    expect(component).toBeTruthy();
    
    const categorias = component.nombresCategorias();
    expect(categorias.length).toBe(2);
    expect(categorias).toEqual(['Estrategia', 'Familiar']);
  });

  it('Deberia transformar nombres a IDs seguros para HTML', () => {
    expect(component.getId('Juegos de Mesa')).toBe('juegos-de mesa');
    expect(component.getId('Estrategia')).toBe('estrategia');
  });

  it('Deberia retornar la imagen correcta segun la categoria o el default', () => {
    expect(component.getImg('Estrategia')).toBe('cat_estrategia.png');
    expect(component.getImg('Categoria Inexistente')).toBe('default.png');
  });

  it('Deberia filtrar los juegos por categoria de forma exacta', () => {
    const juegosEstrategia = component.juegosPorCategoria('Estrategia');
    expect(juegosEstrategia.length).toBe(2);
    expect(juegosEstrategia[0].nombre).toBe('Juego Estrategia 1');

    const juegosFamiliar = component.juegosPorCategoria('Familiar');
    expect(juegosFamiliar.length).toBe(1);
  });

  it('Deberia agregar al carrito, reducir stock y mostrar alerta de exito si hay stock', () => {
    const juegoConStock = juegosMock[0] as Juego;

    component.agregarAlCarrito(juegoConStock);

    expect(mockJuegoService.reducirStock).toHaveBeenCalledWith(1);
    expect(mockCarritoService.agregar).toHaveBeenCalledWith(juegoConStock);

    expect(component.alertaCatalogo()).toEqual({ 
      tipo: 'success', 
      mensaje: '¡Excelente! Agregaste Juego Estrategia 1 al carrito.' 
    });

    // Avance de tiempo nativo de Vitest
    vi.advanceTimersByTime(3000);

    expect(component.alertaCatalogo()).toBeNull();
  });

  it('NO deberia agregar al carrito y mostrar alerta de error si no hay stock', () => {
    const juegoSinStock = juegosMock[1] as Juego;

    component.agregarAlCarrito(juegoSinStock);

    expect(mockJuegoService.reducirStock).not.toHaveBeenCalled();
    expect(mockCarritoService.agregar).not.toHaveBeenCalled();

    expect(component.alertaCatalogo()).toEqual({ 
      tipo: 'danger', 
      mensaje: 'Lo sentimos, este juego se ha quedado sin stock.' 
    });

    // Avance de tiempo nativo de Vitest
    vi.advanceTimersByTime(3000);

    expect(component.alertaCatalogo()).toBeNull();
  });
});