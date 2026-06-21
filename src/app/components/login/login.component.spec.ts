import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService/auth-service';
import { Router, ActivatedRoute } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Mocks
  const mockRouter = {
    navigate: vi.fn()
  };

  const mockAuthService = {
    obtenerUsuarios: vi.fn(),
    login: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deberia inicializar el formulario vacio y en estado invalido', () => {
    expect(component).toBeTruthy();
    
    // Verificar que los campos nazcan vacios
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
    
    // Verificar que el formulario general sea invalido por falta de datos
    expect(component.loginForm.invalid).toBe(true);
  });

  it('Deberia invalidar el formulario si el formato del correo es incorrecto', () => {
    const emailControl = component.loginForm.get('email');
    
    // Ingresar un correo sin el arroba ni dominio
    emailControl?.setValue('correoFalso');
    
    // El control debe detectar el error de patron (email)
    expect(emailControl?.errors?.['email']).toBeTruthy();
    expect(component.loginForm.invalid).toBe(true);
  });

  it('NO deberia llamar a los servicios si el formulario se envia estando invalido', () => {
    // Act: Intentar enviar el formulario vacio
    component.onSubmit();

    // Assert: No debe llamar a ningun metodo del servicio ni intentar navegar
    expect(mockAuthService.obtenerUsuarios).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('Deberia mostrar un mensaje de error si el correo no esta registrado', () => {
    // Arrange: Preparar el formulario con datos validos
    component.loginForm.setValue({ email: 'nuevo@sev.cl', password: '123' });
    
    // Simular que la base de datos devuelve una lista vacia
    mockAuthService.obtenerUsuarios.mockReturnValue([]);

    // Act
    component.onSubmit();

    // Assert: La Signal de error debe actualizarse
    expect(component.mensajeError()).toBe('Error: Este correo no está registrado.');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('Deberia mostrar un mensaje de error si la contraseña es incorrecta', () => {
    // Arrange
    component.loginForm.setValue({ email: 'juan@sev.cl', password: 'ClaveEquivocada' });
    
    // Simular que el usuario existe, pero con otra clave
    mockAuthService.obtenerUsuarios.mockReturnValue([
      { email: 'juan@sev.cl', password: 'ClaveCorrecta123' }
    ]);

    // Act
    component.onSubmit();

    // Assert
    expect(component.mensajeError()).toBe('Error: La contraseña es incorrecta.');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('Deberia iniciar sesion y redirigir al catalogo si es un cliente regular', () => {
    // Arrange
    const usuarioMock = { email: 'juan@sev.cl', password: '123', rol: 'cliente' };
    component.loginForm.setValue({ email: 'juan@sev.cl', password: '123' });
    mockAuthService.obtenerUsuarios.mockReturnValue([usuarioMock]);

    // Act
    component.onSubmit();

    // Assert. Se limpia el error
    expect(component.mensajeError()).toBeNull();
    expect(mockAuthService.login).toHaveBeenCalledWith(usuarioMock);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('Deberia iniciar sesion y redirigir al panel si es administrador', () => {
    // Arrange
    const adminMock = { email: 'admin@sev.cl', password: 'Admin123', rol: 'admin' };
    component.loginForm.setValue({ email: 'admin@sev.cl', password: 'Admin123' });
    mockAuthService.obtenerUsuarios.mockReturnValue([adminMock]);

    // Act
    component.onSubmit();

    // Assert
    expect(mockAuthService.login).toHaveBeenCalledWith(adminMock);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });
});