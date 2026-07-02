import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { JuegoService } from './juego-service';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('JuegoService', () => {
  let service: JuegoService;
  let httpMock: HttpTestingController;

  const urlApi = 'https://cmirandao.github.io/Duoc-api-juegos-mesa/juegos.json';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        JuegoService,
        provideHttpClient(), // Cliente HTTP real
        provideHttpClientTesting(), // Controlador para interceptar peticiones
        { provide: PLATFORM_ID, useValue: 'browser' } // Simulacion del navegador
      ]
    });

    service = TestBed.inject(JuegoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no hayan quedado peticiones HTTP sin responder
    httpMock.verify();
  });


  it('Deberia inicializar los datos haciendo un GET a la API externa', () => {
    // Act: Ejecutar el método privado saltando la restriccion de TypeScript con 'any'
    (service as any).inicializarDatos();

    // Assert 1: Verificar que se haya hecho exactamente una peticion a la URL
    const req = httpMock.expectOne(urlApi);
    expect(req.request.method).toBe('GET');

    // Act 2: Simular la respuesta de GitHub Pages con un catalogo falso
    const mockRespuestaGithub = [{ nombre: 'Catán', stock: 5 }];
    req.flush(mockRespuestaGithub); // "Enviar" la respuesta al servicio

    // Assert 2: Verificar que la Signal proceso los datos y les asigno un ID dinamico (i + 1)
    expect(service.juegos().length).toBe(1);
    expect(service.juegos()[0].id).toBe(1);
    expect(service.juegos()[0].nombre).toBe('Catán');
  });

  it('Deberia reducir el stock de un juego y persistir en localStorage', () => {
    // Arrange: Espiar el localStorage y precargar la Signal con un juego
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    (service as any)._juegos.set([{ id: 1, nombre: 'Dixit', stock: 3 }]);

    // Act
    service.reducirStock(1);

    // Assert
    expect(service.juegos()[0].stock).toBe(2);
    expect(setItemSpy).toHaveBeenCalledWith('juegos', expect.any(String));
  });

  it('Deberia aumentar el stock de un juego y persistir en localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    (service as any)._juegos.set([{ id: 1, nombre: 'Dixit', stock: 3 }]);

    service.aumentarStock(1, 5); // Aumentar en 5

    expect(service.juegos()[0].stock).toBe(8);
    expect(setItemSpy).toHaveBeenCalledWith('juegos', expect.any(String));
  });

  it('Deberia agregar al carrito si hay stock, reducir el inventario y guardar', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    (service as any)._juegos.set([{ id: 1, nombre: 'Scythe', stock: 1 }]);

    const resultado = service.agregarAlCarrito(1);

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toContain('Agregado al carrito');
    expect(service.juegos()[0].stock).toBe(0); // El stock global bajo a 0
    expect(setItemSpy).toHaveBeenCalledWith('carrito', expect.any(String));
  });

  it('NO deberia agregar al carrito si el stock es cero', () => {
    (service as any)._juegos.set([{ id: 1, nombre: 'Scythe', stock: 0 }]);

    const resultado = service.agregarAlCarrito(1);

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain('no hay stock disponible');
    expect(service.juegos()[0].stock).toBe(0);
  });

  it('Deberia eliminar un juego completamente del catalogo', () => {
    (service as any)._juegos.set([
      { id: 1, nombre: 'Juego A' },
      { id: 2, nombre: 'Juego B' }
    ]);

    service.eliminarJuego(1);

    // Verificar que solo quedo el Juego B
    expect(service.juegos().length).toBe(1);
    expect(service.juegos()[0].id).toBe(2);
  });
});