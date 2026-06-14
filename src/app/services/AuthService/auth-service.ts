import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private _usuario = signal<any>(this.obtenerSesionGuardada());
  usuarioActual = this._usuario.asReadonly();
  /*
  * Verificacion de permisos del usuario 
  */
  estaLogueado = computed(() => this._usuario() !== null);
  esAdmin = computed(() => this._usuario()?.rol === 'admin')
  /*
  * Recupera la sesion al refrescar el navegador
  */
  private obtenerSesionGuardada() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const sesion = localStorage.getItem('usuarioSesion');
    return sesion ? JSON.parse(sesion) : null;
  }

  /*
  * Garantiza que el Admin Maestro exista
  */
  obtenerUsuarios(): any[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    let usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
    const adminEmail = 'admin@sev.cl';

    // Si el admin no existe en la lista, lo creamos
    if (!usuarios.find((u: any) => u.email === adminEmail)) {
      const adminBase = {
        username: 'admin',
        email: adminEmail,
        password: 'Admin123',
        rol: 'admin',
        nombre: 'Administrador',
        fechaNacimiento: '1986-01-11',
        direccion: 'Central'
      };
      usuarios.push(adminBase);
      localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
    }
    return usuarios;
  }

  /*
  * Registrar un nuevo usuario
  */
  registrarUsuario(nuevoUsuario: any): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    let usuarios = this.obtenerUsuarios();

    // Validación extra: Evitar correos duplicados
    const correoExiste = usuarios.find((u: any) => u.email === nuevoUsuario.email);
    if (correoExiste) {
      return false;
    }

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
    return true;
  }
  /*
  * Inicia sesion actualizando signals y localStorage 
  */
  login(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuarioSesion', JSON.stringify(user));
    }
    this._usuario.set(user);
  }
  /*
  * Destruye la sesion de forma segura 
  */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioSesion');
    }
    this._usuario.set(null);
  }

}