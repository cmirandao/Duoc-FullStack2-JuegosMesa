import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private _usuario = signal<any>(this.obtenerSesionGuardada());
  usuarioActual = this._usuario.asReadonly();
  /**
   * @description Indica si hay un usuario actualmente autenticado.
   */
  estaLogueado = computed(() => this._usuario() !== null);
  /**
   * @description Indica si el usuario autenticado tiene rol de administrador.
   */
  esAdmin = computed(() => this._usuario()?.rol === 'admin')
  /**
   * @description Recupera la sesión activa guardada en localStorage.
   * @returns Objeto de usuario o null si no existe sesión.
   */
  private obtenerSesionGuardada() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const sesion = localStorage.getItem('usuarioSesion');
    return sesion ? JSON.parse(sesion) : null;
  }

  /**
   * @description Obtiene la lista de usuarios registrados y garantiza la existencia del administrador.
   * @returns Array de usuarios registrados.
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

  /**
   * @description Registra un nuevo usuario si el correo no está en uso.
   * @param nuevoUsuario Datos del usuario a registrar.
   * @returns true si se registró, false si el correo ya existe.
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
  /**
   * @description Inicia sesión guardando el usuario en localStorage y actualizando la señal global.
   * @param user Usuario que inicia sesión.
   * @returns void
   */
  login(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuarioSesion', JSON.stringify(user));
    }
    this._usuario.set(user);
  }
  /**
   * @description Cierra la sesión actual y elimina los datos del usuario del navegador.
   * @returns void
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioSesion');
    }
    this._usuario.set(null);
  }

}