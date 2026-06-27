import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin';
import { JuegoService } from '../../services/JuegoService/juego-service';
import { AuthService } from '../../services/AuthService/auth-service';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Swal from 'sweetalert2';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  /**
   * @description Signal que simula el listado de juegos con stock bajo y normal.
   */
  const mockJuegosSignal = signal([
    { id: 1, stock: 2 },
    { id: 2, stock: 10 }
  ]);

  /**
   * @description Signal que representa al usuario administrador maestro por defecto.
   */
  const mockUsuarioActualSignal = signal({ email: 'admin@sev.cl', nombre: 'Administrador' });

  /**
   * @description Mock del JuegoService utilizado por el componente Admin.
   */
  const mockJuegoService = {
    juegos: mockJuegosSignal,
    eliminarJuego: vi.fn()
  };

  const mockAuthService = {
    obtenerUsuarios: vi.fn().mockReturnValue([
      { username: 'admin', email: 'admin@sev.cl', rol: 'admin' },
      { username: 'test', email: 'test@correo.cl', rol: 'cliente' }
    ]),
    usuarioActual: mockUsuarioActualSignal
  };

  beforeEach(async () => {
    // Limpieza de mocks antes de cada prueba
    vi.clearAllMocks();
    // Vitest que toma el control del tiempo antes de montar el componente
    vi.useFakeTimers()

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: JuegoService, useValue: mockJuegoService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    // Ejecuta ngOnInit y evalua los computed()
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restauracion de mocks para no afectar otras pruebas
    vi.restoreAllMocks();
  });

  it('Deberia inicializar usuarios y calcular KPIs', () => {
    expect(component).toBeTruthy();

    // Verificacion de que se llamo al servicio en el ngOnInit
    expect(mockAuthService.obtenerUsuarios).toHaveBeenCalled();

    // Verificacion de la logica de las Signals Computadas (computed)
    expect(component.totalUsuarios()).toBe(2);
    // Solo un juego tiene stock < 5 en el mock
    expect(component.stockBajo()).toBe(1);
    expect(component.esAdminMaestro()).toBe(true);
  });

  it('Deberia cambiar la vista actual entre inventario y usuarios', () => {
    // Valor por defecto
    expect(component.vistaActual()).toBe('inventario');
    // Cambia a usuarios
    component.toggleVista('usuarios');
    expect(component.vistaActual()).toBe('usuarios');
  });

  it('Deberia eliminar un juego solo si el usuario lo confirma', async() => {
    // Arrange: Se intercepta Swal.fire y se fuerza a devolver TRUE (Aceptar)
    const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false
    } as any);

    // Act
    component.eliminarJuego(1);

    // Assert
    await Promise.resolve(); 
    expect(swalSpy).toHaveBeenCalled();
    expect(mockJuegoService.eliminarJuego).toHaveBeenCalledWith(1);
  });

  it('NO deberia eliminar el juego si el usuario cancela el dialogo', async() => {
    // Arrange: Se intercepta Swal.fire y se fuerza a devolver FALSE (Cancelar)
    vi.spyOn(Swal, 'fire').mockResolvedValue({
      isConfirmed: false,
      isDenied: false,
      isDismissed: true
    } as any);

    // Act
    component.eliminarJuego(2);

    await Promise.resolve();

    // Assert
    expect(mockJuegoService.eliminarJuego).not.toHaveBeenCalled();
  });

  it('Deberia permitir al Admin Maestro cambiar el rol de un usuario cliente y guardar en localStorage', () => {
    // Arrange: Espiar el localStorage
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Act: Intentar cambiar rol a 'test'
    component.toggleRol('test');

    // Assert
    const usuarioModificado = component.usuarios().find(u => u.username === 'test');
    expect(usuarioModificado.rol).toBe('admin');
    expect(localStorageSpy).toHaveBeenCalledWith('usuariosRegistrados', expect.any(String));
  });

  it('NO deberia permitir que el Admin Maestro se quite el rol a si mismo por error', () => {
    // Act: Intentar cambiar el rol del propio admin
    component.toggleRol('admin');

    // Assert
    const usuarioAdmin = component.usuarios().find(u => u.username === 'admin');
    // Debe seguir siendo admin
    expect(usuarioAdmin.rol).toBe('admin');
  });

  it('NO deberia permitir cambiar roles si el usuario logueado no es el Admin Maestro', () => {
    // Arrange: Modificar la Signal para simular que hay otro administrador logueado
    mockUsuarioActualSignal.set({ email: 'otroadmin@sev.cl', nombre: 'Admin Secundario' });

    // Forzar la re-evaluacion de las señales en la prueba
    fixture.detectChanges();

    // Act: El admin secundario intenta ascender a test
    component.toggleRol('test');

    // Assert
    const usuarioTest = component.usuarios().find(u => u.username === 'test');
    // Debe seguir siendo cliente
    expect(usuarioTest.rol).toBe('cliente');
  });

  it('Deberia mostrar un mensaje de proximamente', () => {
    // Act: Ejecutar el metodo
    component.alertaProximamente();

    // Assert 1: Verificar que la Signal contiene el objeto esperado
    expect(component.mensaje()).toEqual({ 
      tipo: 'danger', 
      mensaje: 'Próximamente...' 
    });

    // Act 2: Simular el paso del tiempo nativo de Vitest (3 segundos)
    vi.advanceTimersByTime(3000);

    // Assert 2: Verificar que el setTimeout haya limpiado la alerta
    expect(component.mensaje()).toBeNull();
  });
});