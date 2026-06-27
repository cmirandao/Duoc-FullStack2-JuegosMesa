import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/AuthService/auth-service';
import { Subject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  /**
   * @description Subject para emitir eventos de navegación simulados en pruebas.
   */
  let routerEventsSubject: Subject<any>;

  /**
   * @description Mock del Router con URL inicial y eventos de navegación.
   */
  const mockRouter = {
    url: '/',
    events: null as any,
    navigate: vi.fn()
  };

  const mockAuthService = {
    esAdmin: vi.fn(),
    logout: vi.fn(),
    estaLogueado: vi.fn().mockReturnValue(false)
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    routerEventsSubject = new Subject<any>();

    /**
     * @description Conecta el Subject de eventos al Mock del Router para simular navegación.
     */
    mockRouter.events = routerEventsSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    // Ejecuta ngOnInit y la primera evaluacion de rutas
    fixture.detectChanges();
  });

  it('Deberia crearse y evaluar la URL inicial como no-auth y no-admin', () => {
    expect(component).toBeTruthy();
    expect(component.isAuthRoute()).toBe(false);
    expect(component.isAdminRoute()).toBe(false);
  });

  it('Deberia marcar isAuthRoute como true si se navega a /login, /registro o /recuperar', () => {
    // Act: Simular navegacion a /login
    routerEventsSubject.next(new NavigationEnd(1, '/login', '/login'));

    // Assert
    expect(component.isAuthRoute()).toBe(true);

    // Act: Simular navegacion a /registro
    routerEventsSubject.next(new NavigationEnd(1, '/registro', '/registro'));

    // Assert
    expect(component.isAuthRoute()).toBe(true);
  });

  it('Deberia marcar isAdminRoute como true si se navega a cualquier ruta de /admin', () => {
    // Act: Simular navegacion profunda dentro del panel de admin
    routerEventsSubject.next(new NavigationEnd(1, '/admin/usuarios', '/admin/usuarios'));

    // Assert
    expect(component.isAdminRoute()).toBe(true);
    expect(component.isAuthRoute()).toBe(false);
  });

  it('Deberia alternar y cerrar el menu hamburguesa manipulando la Signal', () => {
    // Estado inicial
    expect(component.isMenuOpen()).toBe(false);

    // Funcion update (toggle)
    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(true);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(false);

    // Probar el cierre dejandolo abierto a proposito
    component.toggleMenu();
    component.closeMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('Deberia limpiar la sesion en el servicio y redirigir al catalogo al hacer logout', () => {
    // Act
    component.logout();

    // Assert
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/catalogo']);
  });

  it('Deberia retornar correctamente el estado de administrador desde el servicio', () => {
    // Simular que es admin
    mockAuthService.esAdmin.mockReturnValue(true);
    expect(component.esAdmin).toBe(true);

    // Simular que es cliente
    mockAuthService.esAdmin.mockReturnValue(false);
    expect(component.esAdmin).toBe(false);
  });
});