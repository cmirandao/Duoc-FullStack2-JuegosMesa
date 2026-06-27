import { TestBed } from '@angular/core/testing';

import { CarritoService } from './carrito-service';

describe('CarritoService', () => {
  /**
   * @description Instancia del servicio CarritoService bajo prueba.
   */
  let service: CarritoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
