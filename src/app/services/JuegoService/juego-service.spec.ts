import { TestBed } from '@angular/core/testing';

import { JuegoService } from './juego-service';

describe('JuegoService', () => {
  /**
   * @description Instancia del servicio JuegoService bajo prueba.
   */
  let service: JuegoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JuegoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
