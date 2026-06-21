import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperarComponent } from './recuperar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService/auth-service';
import { ActivatedRoute } from '@angular/router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('RecuperarComponent', () => {
  let component: RecuperarComponent;
  let fixture: ComponentFixture<RecuperarComponent>;

  // Mock de Servicio
  const mockAuthService = {
    obtenerUsuarios: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Vitest que toma el control del tiempo antes de montar el componente
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [RecuperarComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        // Previene el error NG0201 inyectando una ruta falsa para los RouterLinks del HTML
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restaurar el reloj al terminar cada prueba
    vi.useRealTimers();
  });
  it('Deberia inicializar el formulario vacio y la señal en estado idle', () => {
    expect(component).toBeTruthy();

    // Verificar el estado inicial de la "Maquina de Estados"
    expect(component.estadoRecuperacion()).toBe('idle');

    // Verificar que el control exista y nazca invalido
    expect(component.recuperarForm.get('email')?.value).toBe('');
    expect(component.recuperarForm.invalid).toBe(true);
  });

  it('Deberia bloquear el formulario si el correo no tiene un formato valido', () => {
    const emailControl = component.recuperarForm.get('email');

    // Ingresar un correo mal formateado
    emailControl?.setValue('correoSinArroba.com');

    expect(emailControl?.errors?.['email']).toBeTruthy();
    expect(component.recuperarForm.invalid).toBe(true);
  });

  it('NO deberia consultar a la base de datos si el formulario es invalido', () => {
    // Act: Enviar vacio
    component.onSubmit();

    // Assert
    expect(mockAuthService.obtenerUsuarios).not.toHaveBeenCalled();
    expect(component.estadoRecuperacion()).toBe('idle');
  });

  it('Deberia cambiar el estado a "no-existe" y volver a "idle" tras 6 segundos', () => {
    // Arrange: Preparar un correo que no esta en la base de datos
    component.recuperarForm.setValue({ email: 'desconocido@sev.cl' });

    // Simular la respuesta de la base de datos
    mockAuthService.obtenerUsuarios.mockReturnValue([
      // Solo existe este usuario
      { email: 'registrado@sev.cl' } 
    ]);

    // Act
    component.onSubmit();

    // Assert 1: El estado cambio a error
    expect(component.estadoRecuperacion()).toBe('no-existe');
    // Verificar que NO se haya reseteado el formulario para que el usuario pueda corregirlo
    expect(component.recuperarForm.value.email).toBe('desconocido@sev.cl');

    // Avance de tiempo nativo de Vitest (6000 milisegundos = 6 segundos)
    vi.advanceTimersByTime(6000);

    // Assert 2: El mensaje debe desaparecer
    expect(component.estadoRecuperacion()).toBe('idle');
  });

  it('Deberia cambiar el estado a "exito", resetear formulario y volver a "idle" tras 6 seg', () => {
    // Arrange: Preparar un correo valido
    const correoValido = 'usuario@sev.cl';
    component.recuperarForm.setValue({ email: correoValido });

    // Simular que el correo SI fue encontrado
    mockAuthService.obtenerUsuarios.mockReturnValue([
      { email: correoValido }
    ]);

    // Act
    component.onSubmit();

    // Assert 1: Cambio de estado positivo
    expect(component.estadoRecuperacion()).toBe('exito');

    // Assert 2: Verificar que el formulario se haya limpiado automaticamente
    expect(component.recuperarForm.value.email).toBeNull();

    // Avance de tiempo nativo de Vitest
    vi.advanceTimersByTime(6000);

    // Assert 3: Retorno a estado neutral
    expect(component.estadoRecuperacion()).toBe('idle');
  });
});