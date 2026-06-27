import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService/auth-service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  /**
   * @description Señal para mostrar mensajes de estado en el registro.
   */
  alertaGlobal = signal<{ tipo: 'success' | 'danger', mensaje: string } | null>(null);
  /**
   * @description Formulario reactivo con validaciones de registro.
   */
  registroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    usuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,18}$/)]],
    confirmPassword: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, this.validarEdad(13)]],
    direccion: ['']
  }, { validators: this.passwordCoincide });

  /**
   * @description Procesa el registro del usuario y redirige a login cuando se completa.
   * @returns void
   */
  onSubmit() {
    if (this.registroForm.invalid) return;
    const formValues = this.registroForm.value;
    // Asignacion del rol 'cliente' por defecto
    const nuevoUsuario = { ...formValues, username: formValues.usuario, rol: 'cliente' };
    delete nuevoUsuario.usuario;

    // Se usa el servicio para registrar
    const registroExitoso = this.authService.registrarUsuario(nuevoUsuario);

    if (registroExitoso) {
      this.alertaGlobal.set({ tipo: 'success', mensaje: "¡Registro exitoso! Redirigiendo al login..." });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.alertaGlobal.set({ tipo: 'danger', mensaje: "Error: Este correo electrónico ya se encuentra registrado." });
    }
  }
  /**
   * @description Restablece el formulario de registro y oculta la alerta.
   * @returns void
   */
  onReset() {
    this.registroForm.reset();
    this.alertaGlobal.set(null);
  }

  /**
   * @description Valida que la edad ingresada cumpla la edad mínima.
   * @param minEdad Edad mínima requerida.
   * @returns null si es válido, { menorEdad: true } si es menor.
   */
  validarEdad(minEdad: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      // Si no hay valor, se activa Validators.required
      if (!control.value) {
        return null;
      }
      const fecha = new Date(control.value);
      if (isNaN(fecha.getTime())) {
        return null;
      }
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      // Ajuste fino para los meses (si aún no ha cumplido años este año)
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
      }
      return edad >= minEdad ? null : { menorEdad: true };
    };
  }

  /**
   * @description Verifica que las contraseñas ingresadas coincidan.
   * @param group Grupo de formulario con los controles password y confirmPassword.
   * @returns null si coinciden, { noCoincide: true } si no coinciden.
   */
  passwordCoincide(group: AbstractControl) {
    return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { noCoincide: true };
  }
}
