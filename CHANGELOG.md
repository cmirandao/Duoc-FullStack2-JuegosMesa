# Changelog

Todas las notas de los cambios notables de este proyecto serán documentadas en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-06-14

### Añadido (Added)
- **Arquitectura Angular:** Implementación inicial del framework Angular usando Standalone Components, prescindiendo del uso de NgModules.
- **Formularios Reactivos (Reactive Forms):** Nuevas validaciones síncronas y seguras para los componentes de Autenticación (Login, Registro, Recuperar) y Configuración de Cuenta (Perfil).
- **Sistema de Rutas (Routing):** Implementación de navegación SPA (Single Page Application) con *Lazy Loading* (`loadComponent`) para optimizar los tiempos de carga inicial.
- **Functional Guards:** Nuevos guardianes de ruta (`authGuard` y `adminGuard`) para proteger el acceso a las vistas de `/perfil` y `/admin` contra usuarios no autorizados.

### Cambiado (Changed)
- **Migración Core:** Transición completa del proyecto original construido en HTML estático y Vanilla JS hacia un ecosistema de componentes de Angular.
- **Gestión de Estado (State Management):** Refactorización del manejo de estados dinámicos (estado de sesión, apertura de menús, vistas del panel de control) utilizando **Angular Signals** para una reactividad más eficiente y un ciclo de detección de cambios optimizado.
- **Servicios y LocalStorage:** Centralización de la lógica de negocio y persistencia de datos (Juegos, Carrito, Usuarios, Historial) a través de servicios inyectables (`JuegoService`, `CarritoService`, `AuthService`). Se eliminó la manipulación directa de `localStorage` desde las vistas.
- **Gestión de Estilos:** Centralización de la hoja de estilos en el archivo global `styles.scss`, aprovechando las variables de preprocesador para mantener consistencia en la paleta de colores, tipografías y el diseño a lo largo de todos los componentes.

### Eliminado (Removed)
- Manipulación directa del DOM (ej. `document.getElementById()`, `classList.add()`) a favor de las directivas declarativas de Angular (`@if`, `@for`, `[class]`).
- Archivos `.js` heredados y redundantes de la versión anterior que acoplaban la lógica visual con las reglas de negocio.