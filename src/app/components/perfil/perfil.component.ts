import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/AuthService/auth-service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  perfilForm!: FormGroup;
  mensajeExito = signal(false);

  // Guardamos el historial agrupado en una signal
  historialAgrupado = signal<{ nombre: string, cantidad: number }[]>([]);

  ngOnInit() {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    const esAdminMaestro = usuario.email === 'admin@sev.cl';

    /*
    * Inicializacion del formulario con los datos del usuario
    */
    this.perfilForm = this.fb.group({
      nombre: [{ value: usuario.nombre || '', disabled: esAdminMaestro }, Validators.required],
      usuario: [{ value: usuario.username || '', disabled: true }],
      email: [{ value: usuario.email || '', disabled: true }],

      fechaNacimiento: [{ value: usuario.fechaNacimiento || '', disabled: false }, [Validators.required, this.validarEdad(13)]],
      direccion: [{ value: usuario.direccion || '', disabled: false }],

      password: [{ value: '', disabled: false }, [Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/)]],
      confirmPassword: [{ value: '', disabled: false }]
    }, { validators: this.passwordCoincide });

    // Se carga el historial si no es el admin maestro
    if (!esAdminMaestro) {
      this.cargarHistorial(usuario.username);
    }
  }

  cargarHistorial(username: string) {
    const historialCompleto = JSON.parse(localStorage.getItem('historialCompras') || '[]');
    const misCompras = historialCompleto.filter((h: any) => h.username === username);

    const agrupado = misCompras.reduce((acc: any, compra: any) => {
      if (!acc[compra.nombre]) acc[compra.nombre] = { nombre: compra.nombre, cantidad: 0 };
      acc[compra.nombre].cantidad += 1;
      return acc;
    }, {});

    this.historialAgrupado.set(Object.values(agrupado));
  }

  onSubmit() {
    if (this.perfilForm.invalid) return;

    const usuario = this.authService.usuarioActual();

    // getRawValue() extrae también los datos de los campos 'disabled' para no perderlos
    const formValues = this.perfilForm.getRawValue();

    const usuarioActualizado = {
      ...usuario,
      nombre: formValues.nombre,
      fechaNacimiento: formValues.fechaNacimiento,
      direccion: formValues.direccion,
      // Si ingreso una nueva password, se actualiza, si no, se deja la antigua
      password: formValues.password ? formValues.password : usuario.password
    };

    // Actualizar en el array global de usuarios (LocalStorage)
    let usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
    const index = usuariosRegistrados.findIndex((u: any) => u.username === usuarioActualizado.username);
    if (index !== -1) {
      usuariosRegistrados[index] = usuarioActualizado;
      localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
    }

    // Usamos el metodo login del AuthService para actualizar la Signal global
    this.authService.login(usuarioActualizado);

    // Limpiar los campos de contraseña
    this.perfilForm.patchValue({ password: '', confirmPassword: '' });

    // Mostrar mensaje de exito temporal
    this.mensajeExito.set(true);
    setTimeout(() => this.mensajeExito.set(false), 4000);
  }

  /*
  *  Validadores Personalizados
  */
  validarEdad(minEdad: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fecha = new Date(control.value);
      if (isNaN(fecha.getTime())) return null;
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
      return edad >= minEdad ? null : { menorEdad: true };
    };
  }

  passwordCoincide(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass) return null;
    return pass === confirm ? null : { noCoincide: true };
  }
}
