import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService/auth-service';

@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './recuperar.component.html',
  styleUrl: './recuperar.component.scss',
})
export class RecuperarComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  /*
  * Formulario reactivo
  */
  recuperarForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /*
  * Señal para manejar el estado del mensaje ('idle' | 'exito' | 'no-existe')
  */
  estadoRecuperacion = signal<'idle' | 'exito' | 'no-existe'>('idle');

  onSubmit() {
    if (this.recuperarForm.invalid) return;

    const emailIngresado = this.recuperarForm.value.email;
    const usuarios = this.authService.obtenerUsuarios();

    /*
    * Se verifica si el correo existe en la base de datos (localStorage)
    */
    const correoExiste = usuarios.some((u: any) => u.email === emailIngresado);

    if (correoExiste) {
      // Caso 1: El correo existe
      this.estadoRecuperacion.set('exito');
      this.recuperarForm.reset();
    } else {
      // Caso 2: El correo NO existe
      this.estadoRecuperacion.set('no-existe');
    }

    // Ocultar cualquier mensaje después de 6 segundos
    setTimeout(() => {
      this.estadoRecuperacion.set('idle');
    }, 6000);
  }
}
