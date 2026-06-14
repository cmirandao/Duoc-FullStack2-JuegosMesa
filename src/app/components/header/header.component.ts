import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/AuthService/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  // Estado del menú: abierto o cerrado
  isMenuOpen = signal(false);

  // Detectamos si estamos en Admin
  isAuthRoute = signal(false);
  isAdminRoute = signal(false);

  ngOnInit() {
    // Verificamos la URL actual nada mas cargar el componente
    this.evaluarRutas(this.router.url);

    // Suscripcion para futuros cambios de navegacion
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.evaluarRutas(event.urlAfterRedirects);
      }
    });
  }

  // Evaluacion de rutas para ejecutar guardianes de auth.guards
  private evaluarRutas(url: string) {
    // Convertimos a minúsculas por seguridad
    const rutaSegura = url.toLowerCase();
    
    this.isAuthRoute.set(
      rutaSegura.includes('/login') || 
      rutaSegura.includes('/registro') || 
      rutaSegura.includes('/recuperar')
    );
    
    this.isAdminRoute.set(rutaSegura.includes('/admin'));
  }

  get esAdmin() { return this.authService.esAdmin(); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/catalogo']);
  }
  // Control de menu responsivo
  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  // Cerrar menu hamburguesa
  closeMenu() {
    this.isMenuOpen.set(false);
  }
}