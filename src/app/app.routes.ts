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
  /* 
  * RUTAS PROTEGIDAS: No pueden acceder si no 
  * estan logueados y sin el rol necesario 
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