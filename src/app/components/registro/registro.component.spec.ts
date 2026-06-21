import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroComponent } from './registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/AuthService/auth-service';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;

  // Mocks
  const mockRouter = {
    navigate: vi.fn()
  };

  const mockAuthService = {
    registrarUsuario: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Indicar a Vitest que tome el control del reloj
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        // Previene el error NG0201 inyectando una ruta falsa para los RouterLinks del HTML
        { provide: ActivatedRoute, useValue: {} } 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restaurar el reloj a la normalidad
    vi.useRealTimers();
  });

  it('Deberia inicializar el formulario con todos sus campos vacios e invalido', () => {
    expect(component).toBeTruthy();
    expect(component.registroForm.invalid).toBe(true);
    
    // Verificar que los campos obligatorios nazcan limpios
    const formValues = component.registroForm.value;
    expect(formValues.nombre).toBe('');
    expect(formValues.email).toBe('');
    expect(formValues.password).toBe('');
  });

  it('Deberia invalidar la fecha de nacimiento si el usuario es menor de 13 años', () => {
    const fechaControl = component.registroForm.get('fechaNacimiento');
    
    // Calcular una fecha que represente exactamente 10 años atrás
    const hoy = new Date();
    const fechaMenor = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate());
    
    // Formatear a YYYY-MM-DD para el input de tipo date
    const fechaString = fechaMenor.toISOString().split('T')[0];
    fechaControl?.setValue(fechaString);

    expect(fechaControl?.errors?.['menorEdad']).toBeTruthy();
  });

  it('Deberia validar la fecha de nacimiento si el usuario tiene 13 años o más', () => {
    const fechaControl = component.registroForm.get('fechaNacimiento');
    
    // Calcular una fecha de hace 20 años
    const hoy = new Date();
    const fechaMayor = new Date(hoy.getFullYear() - 20, hoy.getMonth(), hoy.getDate());
    fechaControl?.setValue(fechaMayor.toISOString().split('T')[0]);

    expect(fechaControl?.errors).toBeNull();
  });

  it('Deberia generar un error global si las contraseñas no coinciden', () => {
    component.registroForm.get('password')?.setValue('ClaveValida123!');
    component.registroForm.get('confirmPassword')?.setValue('ClaveDistinta999!');

    // El error se aloja a nivel del FormGroup (validators de grupo)
    expect(component.registroForm.errors?.['noCoincide']).toBeTruthy();
  });

  it('NO deberia generar error si las contraseñas coinciden perfectamente', () => {
    component.registroForm.get('password')?.setValue('ClaveValida123!');
    component.registroForm.get('confirmPassword')?.setValue('ClaveValida123!');

    expect(component.registroForm.errors?.['noCoincide']).toBeUndefined();
  });

  it('Deberia rechazar contraseñas debiles (falta mayuscula, numero o simbolo)', () => {
    const passwordControl = component.registroForm.get('password');
    
    passwordControl?.setValue('solominusculas123');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();

    passwordControl?.setValue('SOLOMAYUSCULAS123');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();
    
    // Contraseña valida
    passwordControl?.setValue('PasswordFuerte_123');
    expect(passwordControl?.errors?.['pattern']).toBeUndefined();
  });

  it('NO deberia intentar registrar al usuario si el formulario es invalido', () => {
    component.onSubmit();
    expect(mockAuthService.registrarUsuario).not.toHaveBeenCalled();
  });

  it('Deberia mostrar alerta de error si el servicio rechaza el registro', () => {
    // Arrange: Formulario completamente valido
    component.registroForm.setValue({
      nombre: 'Pedro',
      usuario: 'pedro123',
      email: 'pedro@sev.cl',
      password: 'PasswordFuerte_123',
      confirmPassword: 'PasswordFuerte_123',
      fechaNacimiento: '1990-01-01',
      direccion: 'Calle 123'
    });

    // Simular que el correo ya existe
    mockAuthService.registrarUsuario.mockReturnValue(false);

    // Act
    component.onSubmit();

    // Assert
    expect(component.alertaGlobal()).toEqual({ 
      tipo: 'danger', 
      mensaje: 'Error: Este correo electrónico ya se encuentra registrado.' 
    });
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('Deberia procesar el usuario, mostrar alerta y redirigir tras 2 segundos', () => {
    // Arrange: Formulario valido
    component.registroForm.setValue({
      nombre: 'Ana',
      usuario: 'ana123',
      email: 'ana@sev.cl',
      password: 'PasswordFuerte_123',
      confirmPassword: 'PasswordFuerte_123',
      fechaNacimiento: '1995-05-15',
      direccion: 'Avenida Siempre Viva 742'
    });

    mockAuthService.registrarUsuario.mockReturnValue(true);

    // Act
    component.onSubmit();

    // Assert 1: Verificar que se haya eliminado el campo "usuario" y agregado el rol "cliente"
    expect(mockAuthService.registrarUsuario).toHaveBeenCalledWith({
      nombre: 'Ana',
      username: 'ana123',
      email: 'ana@sev.cl',
      password: 'PasswordFuerte_123',
      confirmPassword: 'PasswordFuerte_123',
      fechaNacimiento: '1995-05-15',
      direccion: 'Avenida Siempre Viva 742',
      rol: 'cliente'
    });

    // Assert 2: Alerta visual de exito instanciada
    expect(component.alertaGlobal()).toEqual({ 
      tipo: 'success', 
      mensaje: '¡Registro exitoso! Redirigiendo al login...' 
    });

    // Avance de tiempo nativo de Vitest
    vi.advanceTimersByTime(2000);

    // Assert 3: Navegacion final
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('Deberia limpiar el formulario y las alertas al ejecutar onReset', () => {
    // Llenar y establecer un error
    component.registroForm.get('nombre')?.setValue('Carlos');
    component.alertaGlobal.set({ tipo: 'danger', mensaje: 'Error falso' });

    // Act
    component.onReset();

    // Assert
    expect(component.registroForm.value.nombre).toBeNull();
    expect(component.alertaGlobal()).toBeNull();
  });
});