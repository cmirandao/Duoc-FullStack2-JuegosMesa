# Changelog

Todas las notas de los cambios notables de este proyecto serán documentadas en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [1.2.0] - 2026-07-01

### Añadido (Added)
- **Cliente HTTP:** Configuración global de `provideHttpClient()` en `app.config.ts` para habilitar peticiones de red en toda la aplicación bajo la arquitectura Standalone.
- **API REST Simulada:** Creación de un repositorio en GitHub Pages para servir el archivo `juegos.json`, simulando un entorno Backend en la nube.

### Cambiado (Changed)
- **Consumo Asíncrono:** Refactorización profunda de `JuegoService`. La carga inicial del catálogo ahora se realiza mediante una petición HTTP `GET` consumiendo el JSON externo y suscribiéndose al Observable, reemplazando el flujo síncrono.
- **Persistencia de Datos:** El sistema ahora actúa de forma híbrida: descarga el catálogo desde la API externa si el `localStorage` está vacío, pero mantiene las operaciones CRUD de stock de forma local para no perder la fluidez de la interfaz.

### Eliminado (Removed)
- Eliminada la función estática `obtenerJuegosIniciales()` y toda la data en duro (hardcoded) del código fuente, delegando la responsabilidad de los datos al JSON externo.

## [1.1.1] - 2026-06-26

### Añadido (Added)
- **Documentación de Componentes:** Se agregó JSDoc consistente a múltiples componentes y servicios para mejorar la generación de documentación con Compodoc.

### Cambiado (Changed)
- **Validación de Credenciales:** Actualización de patrones de validación de email y contraseña en `RegistroComponent` para reforzar el control de datos y compatibilidad con el estándar de correo electrónico.
- **Normalización de Tests:** Refactorización de comentarios de prueba a JSDoc en los archivos `.spec.ts`, mejorando la claridad y consistencia de la suite de pruebas.

### Solucionado (Fixed)
- **Corrige la validación de perfil:** Se agregó una verificación de formulario inválido en `PerfilComponent.onSubmit()` para evitar guardar cambios cuando el formulario no es válido.
- **Pruebas unitarias:** Todos los tests pasan (`65 passed`) tras corregir el flujo de perfil inválido.

### Eliminado (Removed)
- Comentarios de prueba en estilo `//` en favor de bloques JSDoc consistentes en los archivos de tests.

## [1.1.0] - 2026-06-21

### Añadido (Added)
- **Vista de Detalle de Producto:** Nueva ruta dinámica (`detalle/:id`) para visualizar información individual de cada juego. Incluye un selector numérico de cantidad estrictamente vinculado a los límites de inventario y estandarización visual de imágenes mediante `object-fit`.
- **Notificaciones UI:** Nuevo sistema global de alertas efímeras (Toasts) controladas mediante Angular Signals, reemplazando las ventanas bloqueantes del navegador.
- **SweetAlert2:** Integración de modales interactivos para las acciones críticas de administración (ej. eliminación de juegos y confirmaciones).
- **Vitest:** Implementación de un entorno de pruebas moderno, rápido y compatible con la arquitectura Zoneless de las nuevas versiones de Angular.
- **Testing Arquitectónico:** Implementación completa de las pruebas unitarias a un modelo de "Viaje en el tiempo" nativo (`vi.useFakeTimers()`)

### Cambiado (Changed)
- **Refactorización de Servicios:** Los servicios (`JuegoService`, `CarritoService`) ahora retornan objetos de estado lógico en lugar de interactuar directamente con el DOM, respetando el principio de responsabilidad única.

### Solucionado (Fixed)
- **Estilos del Botón de Pago:** Agregada la pseudo-clase `:disabled` en SCSS para oscurecer y bloquear visualmente el botón cuando el carrito está vacío.
- **Inyección de Dependencias en Pruebas:** Resuelto el error `NG0201 (No provider for ActivatedRoute)` aislando correctamente los componentes que utilizan `RouterLink`.

### Eliminado (Removed)
- Uso de `window.alert()` y `window.confirm()` en toda la aplicación para mejorar drásticamente la experiencia de usuario (UX).
- Dependencias legacy de Jasmine y Karma en favor del ecosistema Vite/Vitest.

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