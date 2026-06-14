import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuegoService } from '../../services/JuegoService/juego-service';
import { AuthService } from '../../services/AuthService/auth-service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  juegoService = inject(JuegoService);
  authService = inject(AuthService);

  // Alternar paneles de administracion
  vistaActual = signal<'inventario' | 'usuarios'>('inventario');
  usuarios = signal<any[]>([]);

  // Calculo de KPIs del dashboard de administrador
  stockBajo = computed(() => this.juegoService.juegos().filter(j => j.stock < 5).length);
  totalUsuarios = computed(() => this.usuarios().length);

  // Verificacion si es Admin Maestro
  esAdminMaestro = computed(() => this.authService.usuarioActual()?.email === 'admin@sev.cl');

  ngOnInit() {
    // Al cargar el componente, obtenemos la lista de usuarios desde el servicio
    this.usuarios.set(this.authService.obtenerUsuarios());
  }

  toggleVista(vista: 'inventario' | 'usuarios') {
    this.vistaActual.set(vista);
  }
  // Elimina un juego junto a todo su stock
  eliminarJuego(id: number) {
    if (confirm(`¿Estás seguro de eliminar el juego #${id}? Esto eliminará todo el stock disponible.`)) {
      this.juegoService.eliminarJuego(id);
    }
  }

  // Logica para cambiar roles (Solo Admin Maestro)
  toggleRol(username: string) {
    // Doble validación de seguridad
    if (!this.esAdminMaestro()) return;

    // Actualizacion de la lista
    const listaActualizada = this.usuarios().map(u => {
      // Evitar que el admin maestro se cambie el rol a si mismo por error
      if (u.username === username && u.email !== 'admin@sev.cl') {
        return { ...u, rol: u.rol === 'admin' ? 'cliente' : 'admin' };
      }
      return u;
    });

    // Guardamos en la Signal y en el LocalStorage
    this.usuarios.set(listaActualizada);
    localStorage.setItem('usuariosRegistrados', JSON.stringify(listaActualizada));
  }

  alertaProximamente() {
    alert('Próximamente...');
  }
}