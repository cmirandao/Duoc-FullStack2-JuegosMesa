import { Component, inject } from '@angular/core';
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
/* 
 * Inicializacion del formulario y sus validaciones 
*/
  registroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    usuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/)]],
    confirmPassword: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, this.validarEdad(13)]],
    direccion: ['']
  }, { validators: this.passwordCoincide });

  onSubmit() {
    if (this.registroForm.invalid) return;
    const formValues = this.registroForm.value;
    // Asignacion del rol 'cliente' por defecto
    const nuevoUsuario = { ...formValues, username: formValues.usuario, rol: 'cliente' };
    delete nuevoUsuario.usuario;

    // Se usa el servicio para registrar
    const registroExitoso = this.authService.registrarUsuario(nuevoUsuario);

    if (registroExitoso) {
      alert("¡Registro exitoso! Ya puedes iniciar sesión.");
      this.router.navigate(['/login']);
    } else {
      // Si registrarUsuario devolvió false, es porque el correo ya existe
      alert("Error: Este correo electrónico ya se encuentra registrado.");
    }
  }
  /*
  * Limpiar todos los campos 
  */
  onReset() {
    this.registroForm.reset();
  }

  /*
  * Validador edad minima
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

  /*
  * Valida coincidencia de passwords
  */
  passwordCoincide(group: AbstractControl) {
    return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { noCoincide: true };
  }
}
