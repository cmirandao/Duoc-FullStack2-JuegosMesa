import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';

describe('AuthService', () => {
  /**
   * @description Instancia del servicio AuthService creada por TestBed.
   */
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
