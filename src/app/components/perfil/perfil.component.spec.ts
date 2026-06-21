import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService/auth-service';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  // Mocks de Servicio
  const mockAuthService = {
    usuarioActual: vi.fn(),
    login: vi.fn()
  };

  // Datos de prueba
  const usuarioClienteMock = {
    username: 'juan',
    email: 'juan@sev.cl',
    nombre: 'Juan Perez',
    fechaNacimiento: '1990-05-15',
    direccion: 'Calle 123',
    password: 'PasswordAntigua123!'
  };

  // Mock admin maestro
  const usuarioAdminMock = {
    username: 'admin',
    email: 'admin@sev.cl',
    nombre: 'Administrador'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Vitest que toma el control del tiempo antes de montar el componente
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;

    // Configurar al Cliente como el usuario por defecto para montar el componente
    mockAuthService.usuarioActual.mockReturnValue(usuarioClienteMock);
    
    // Ejecutara ngOnInit internamente
    fixture.detectChanges(); 
  });

  afterEach(() => {
    // Restaurar el reloj al terminar cada prueba
    vi.useRealTimers();
  });

  it('Deberia inicializar el formulario con los datos del usuario cliente', () => {
    expect(component).toBeTruthy();
    
    // El campo usuario y email deben estar siempre deshabilitados
    expect(component.perfilForm.get('usuario')?.disabled).toBe(true);
    expect(component.perfilForm.get('email')?.disabled).toBe(true);

    // Como es cliente, el nombre SI debe poder editarse
    expect(component.perfilForm.get('nombre')?.disabled).toBe(false);
    
    // Verificar que se cargaron los valores correctamente
    expect(component.perfilForm.get('nombre')?.value).toBe('Juan Perez');
  });

  it('Deberia deshabilitar la edicion del nombre si el usuario es el Admin Maestro', () => {
    // Arrange: Cambiar la respuesta del servicio para simular al Admin
    mockAuthService.usuarioActual.mockReturnValue(usuarioAdminMock);
    
    // Act: Re-ejecutar manualmente el ngOnInit para aplicar la nueva logica
    component.ngOnInit();

    // Assert: El nombre ahora debe estar bloqueado
    expect(component.perfilForm.get('nombre')?.disabled).toBe(true);
  });

  it('Deberia cargar y agrupar el historial de compras del usuario correctamente', () => {
    // Arrange: Interceptar localStorage para devolver compras falsas
    const mockHistorial = [
      // Compra Catan dos veces
      { username: 'juan', nombre: 'Catan' },
      { username: 'juan', nombre: 'Catan' },
      { username: 'juan', nombre: 'Dixit' },
      { username: 'otrousuario', nombre: 'Virus' } // No deberia aparecerle a juan
    ];
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockHistorial));

    // Act
    component.cargarHistorial('juan');

    // Assert: Verificar que la Signal agrupo y sumo las cantidades
    const agrupado = component.historialAgrupado();
    expect(agrupado.length).toBe(2);
    
    const catanData = agrupado.find(j => j.nombre === 'Catan');
    expect(catanData?.cantidad).toBe(2);

    const dixitData = agrupado.find(j => j.nombre === 'Dixit');
    expect(dixitData?.cantidad).toBe(1);
  });

  it('Deberia validar que la nueva contraseña y su confirmacion coincidan', () => {
    // Si no ingresa contraseña, el validador retorna null (valido)
    expect(component.perfilForm.errors).toBeNull();

    // Probar contraseñas distintas
    component.perfilForm.patchValue({
      password: 'NuevaPassword123!',
      confirmPassword: 'DistintaPassword123!'
    });
    // El error 'noCoincide' se aloja en el grupo principal
    expect(component.perfilForm.errors?.['noCoincide']).toBeTruthy();

    // Probar contraseñas identicas
    component.perfilForm.patchValue({
      confirmPassword: 'NuevaPassword123!'
    });
    expect(component.perfilForm.errors).toBeNull();
  });

  it('NO deberia guardar los cambios si el formulario es invalido', () => {
    // Arrange: Romper el formulario dejando un campo requerido vacio
    component.perfilForm.patchValue({ nombre: '' });
    
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Act
    component.onSubmit();

    // Assert
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('Deberia actualizar el usuario, guardarlo en localStorage y mostrar mensaje de exito temporal', () => {
    // Arrange: Preparar la base de datos falsa (localStorage)
    const baseDatosFalsa = [{ username: 'juan', nombre: 'Antiguo Nombre' }];
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(baseDatosFalsa));
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Simular que el usuario cambia su nombre y direccion
    component.perfilForm.patchValue({
      nombre: 'Juan Actualizado',
      direccion: 'Nueva Calle 456'
    });

    // Act
    component.onSubmit();

    // Assert 1: Verificar que se actualizo el Storage
    expect(setItemSpy).toHaveBeenCalledWith('usuariosRegistrados', expect.any(String));
    
    // Obtencion de los argumentos con los que se llamo a localStorage
    const datosGuardados = JSON.parse(setItemSpy.mock.calls[0][1] as string);
    expect(datosGuardados[0].nombre).toBe('Juan Actualizado');

    // Assert 2: Verificar que se propago la sesion
    expect(mockAuthService.login).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'Juan Actualizado',
      direccion: 'Nueva Calle 456'
    }));

    // Assert 3: Verificar la limpieza de las contraseñas tras guardar
    expect(component.perfilForm.get('password')?.value).toBe('');
    
    // Assert 4: Verificar el temporizador de la Signal
    expect(component.mensajeExito()).toBe(true);
    // Avanzar 4 segundos en Vitest
    vi.advanceTimersByTime(4000); 
    
    expect(component.mensajeExito()).toBe(false);
  });
});