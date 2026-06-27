import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  
  /**
   * @description Subject que controla y emite eventos simulados del Router en las pruebas.
   */
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();

    /**
     * @description Mock del Router que expone el Subject como un Observable de eventos.
     */
    const mockRouter = {
      events: routerEventsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    })
    /**
     * @description Aisla el componente raíz sobrescribiendo su plantilla y evitando dependencias del HeaderComponent.
     */
    .overrideComponent(AppComponent, {
      set: { template: '<div></div>' } 
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    /**
     * @description Evita la inicialización completa de la vista para probar solo la lógica de la clase.
     */
  });

  // --- PRUEBA 1: Verificación de Montaje ---
  it('debería crearse el componente raíz correctamente', () => {
    expect(component).toBeTruthy();
    // Verificamos el valor inicial de la Signal
    expect(component.currentUrl()).toBe('/'); 
  });

  // --- PRUEBA 2: Suscripción a Eventos (Filtro Positivo) ---
  it('debería actualizar currentUrl al recibir un evento NavigationEnd', () => {
    // Act: Emitimos un evento simulado de término de navegación
    routerEventsSubject.next(new NavigationEnd(1, '/catalogo', '/catalogo'));

    // Assert: Verificamos que la Signal atrapó el evento y se actualizó
    expect(component.currentUrl()).toBe('/catalogo');
  });

  // --- PRUEBA 3: Suscripción a Eventos (Filtro Negativo) ---
  it('NO debería actualizar currentUrl si el evento NO es NavigationEnd', () => {
    // Arrange: Fijamos un estado inicial
    component.currentUrl.set('/inicio');

    // Act: Emitimos un evento distinto (ej. NavigationStart)
    // El operador filter() de RxJS en el constructor debería ignorar esto
    routerEventsSubject.next(new NavigationStart(1, '/perfil'));

    // Assert: La Signal debe mantener su valor intacto
    expect(component.currentUrl()).toBe('/inicio');
  });

  // --- PRUEBA 4: Lógica de Negocio (Signal Computada) ---
  it('showNavbar debería ser false cuando la ruta es /login o /registro', () => {
    // Simulamos navegación al Login
    routerEventsSubject.next(new NavigationEnd(1, '/login', '/login'));
    expect(component.showNavbar()).toBe(false);

    // Simulamos navegación al Registro
    routerEventsSubject.next(new NavigationEnd(1, '/registro', '/registro'));
    expect(component.showNavbar()).toBe(false);
  });

  // --- PRUEBA 5: Lógica de Negocio (Caso por defecto) ---
  it('showNavbar debería ser true en cualquier otra ruta del sistema', () => {
    // Simulamos navegación al Catálogo
    routerEventsSubject.next(new NavigationEnd(1, '/catalogo', '/catalogo'));
    expect(component.showNavbar()).toBe(true);

    // Simulamos navegación al Perfil
    routerEventsSubject.next(new NavigationEnd(1, '/perfil', '/perfil'));
    expect(component.showNavbar()).toBe(true);
  });
});