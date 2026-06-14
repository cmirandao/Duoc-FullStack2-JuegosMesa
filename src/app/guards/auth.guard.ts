import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/AuthService/auth-service';

// Guardian para proteger "Mi Perfil" (Solo usuarios logueados)
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.estaLogueado()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};

// Guardian para proteger "Panel de Control" (Solo Administradores)
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificamos si esta logueado Y si es administrador
    if (authService.estaLogueado() && authService.esAdmin()) {
        return true;
    } else {
        router.navigate(['/catalogo']);
        return false;
    }
};