import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/AuthService/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Para mostrar mensajes de error en vez de usar alert
  mensajeError = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    const usuarios = this.authService.obtenerUsuarios();
    const usuario = usuarios.find((u: any) => u.email === email);

    if (!usuario) {
      this.mensajeError.set("Error: Este correo no está registrado.");
      return;
    }

    if (usuario.password !== password) {
      this.mensajeError.set("Error: La contraseña es incorrecta.");
      return;
    }

    /*
    *  Iniciar sesion usando el servicio para emitir el cambio a toda la aplicacion
    */
    this.mensajeError.set(null);
    this.authService.login(usuario);

    // Redirigir segun rol
    usuario.rol === 'admin' ? this.router.navigate(['/admin']) : this.router.navigate(['/']);
  }
}