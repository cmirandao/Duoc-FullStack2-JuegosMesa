import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuegoService } from '../../services/JuegoService/juego-service';
import { AuthService } from '../../services/AuthService/auth-service';
// Para reemplazar los windows.confirm por algo mas estetico
import Swal from 'sweetalert2';

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
  // Para mostrar mensajes de error en vez de usar alert
  mensaje = signal<{ tipo: 'success' | 'danger', mensaje: string } | null>(null);

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
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar el juego #${id} y todo su stock. ¡Esta acción no se puede deshacer!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c0392b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      // Esta promesa se resuelve cuando el usuario hace clic en algun boton
      if (result.isConfirmed) {
        this.juegoService.eliminarJuego(id);
        // Mostrar mensaje de exito
        Swal.fire(
          '¡Eliminado!',
          'El juego ha sido borrado del inventario.',
          'success'
        );
      }
    });
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
    this.mostrarAlerta('danger', 'Próximamente...');
  }

  private mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.mensaje.set({ tipo, mensaje });
    setTimeout(() => {
      this.mensaje.set(null);
    }, 3000);
  }
}