import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto: Redirige al catálogo
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },

  {
    path: 'catalogo',
    loadComponent: () => import('./components/catalogo/catalogo.component').then(m => m.CatalogoComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./components/catalogo/detalle/detalle.component').then(m => m.DetalleComponent)
  },
  {
    path: 'carro',
    loadComponent: () => import('./components/carro/carro.component').then(m => m.CarroComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./components/recuperar/recuperar.component').then(m => m.RecuperarComponent)
  },
  /**
   * @description Rutas protegidas que solo pueden acceder usuarios autenticados con el rol adecuado.
   */
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/admin').then(m => m.AdminComponent)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  { path: '**', redirectTo: 'catalogo' }
];