import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Juego } from '../../models/juego.model';
import { JuegoService } from '../JuegoService/juego-service';
import { AuthService } from '../AuthService/auth-service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private juegoService = inject(JuegoService);
  private authService = inject(AuthService);
  /**
   * @description Estado reactivo del carrito inicializado desde localStorage.
   */
  private _items = signal<Juego[]>(this.cargarCarrito());

  /**
   * @description Devuelve los items actuales del carrito.
   * @returns Array de juegos en el carrito.
   */
  get items() {
    return this._items();
  }
  /**
   * @description Calcula el total del carrito.
   * @returns Suma de los precios de los items.
   */
  get total() {
    return this._items().reduce((acc, item) => acc + item.precio, 0);
  }
  /**
   * @description Agrupa los items del carrito por juego.
   * @returns Array de juegos con cantidad y subtotal.
   */
  itemsAgrupados = computed(() => {
    const mapa = new Map<number, any>();

    this._items().forEach(item => {
      if (mapa.has(item.id)) {
        const existente = mapa.get(item.id);
        existente.cantidad++;
        existente.subtotal = existente.cantidad * item.precio;
      } else {
        mapa.set(item.id, {
          ...item,
          cantidad: 1,
          subtotal: item.precio
        });
      }
    });
    return Array.from(mapa.values());
  });

  /**
   * @description Carga el carrito desde localStorage en el navegador.
   * @returns Array de juegos actualmente en el carrito.
   */
  private cargarCarrito(): Juego[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    return JSON.parse(localStorage.getItem('carrito') || '[]');
  }

  /**
   * @description Agrega un juego al carrito y sincroniza el estado.
   * @param juego Juego que se agregará.
   * @returns void
   */
  agregar(juego: Juego) {
    const carritoActual = this.cargarCarrito();
    const nuevoCarrito = [...carritoActual, juego];
    this.actualizarEstado(nuevoCarrito);
  }
  /**
   * @description Elimina todas las instancias de un juego del carrito y devuelve stock al inventario.
   * @param id Identificador del juego a eliminar.
   * @returns void
   */
  eliminar(id: number) {
    const cantidadEnCarrito = this._items().filter(i => i.id === id).length;
    if (cantidadEnCarrito > 0) {
      this.juegoService.aumentarStock(id, cantidadEnCarrito);
    }
    this._items.update(items => items.filter(i => i.id !== id));
    this.guardar();
  }

  /**
   * @description Guarda el estado actual del carrito en localStorage.
   * @returns void
   */
  private guardar() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(this._items()));
    }
  }

  /**
   * @description Actualiza el carrito en memoria y en localStorage.
   * @param nuevoCarrito Carrito actualizado.
   * @returns void
   */
  private actualizarEstado(nuevoCarrito: Juego[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      this._items.set(nuevoCarrito);
    }
  }
  /**
   * @description Modifica la cantidad de un juego en el carrito.
   * @param id Identificador del juego.
   * @param delta Incremento o decremento de unidades.
   * @returns void
   */
  modificarCantidad(id: number, delta: number) {
    // Lógica: delta 1 (sumar) o -1 (restar)
    if (delta > 0) {
      const juego = this.juegoService.juegos().find(j => j.id === id);
      if (juego && juego.stock > 0) {
        this.juegoService.reducirStock(id);
        this.agregar(juego);
      }
    } else {
      this.eliminarUnItem(id);
      this.juegoService.aumentarStock(id);
    }
  }

  /**
   * @description Elimina una sola instancia de un juego en el carrito.
   * @param id Identificador del juego.
   * @returns void
   */
  private eliminarUnItem(id: number) {
    this._items.update(items => {
      const index = items.findIndex(i => i.id === id);
      if (index !== -1) {
        const nuevosItems = [...items];
        nuevosItems.splice(index, 1);
        return nuevosItems;
      }
      return items;
    });
    this.guardar();
  }
  /**
   * @description Procesa el pago y registra el historial de compra si hay sesión activa.
   * @returns Resultado de la compra con estado, mensaje y tipo de alerta.
   */
  procesarPago(): { exito: boolean, mensaje: string, tipo: 'success' | 'warning' } {
    const carrito = this._items();
    if (carrito.length === 0) return { exito: false, mensaje: "Tu carrito está vacío.", tipo: 'warning' };

    const usuario = this.authService.usuarioActual();
    let mensajeRespuesta = "";
    let tipoRespuesta: 'success' | 'warning' = 'success';

    if (usuario) {
      let historial = JSON.parse(localStorage.getItem('historialCompras') || '[]');

      const compra = carrito.map(item => ({
        ...item,
        username: usuario.username,
        fecha: new Date().toLocaleDateString()
      }));

      historial.push(...compra);
      localStorage.setItem('historialCompras', JSON.stringify(historial));
      mensajeRespuesta = "¡Muchas gracias por tu compra!";
    } else {
      mensajeRespuesta = "¡Muchas gracias por tu compra! Te invitamos a registrarte y poder llevar el historial de tus compras.";
      tipoRespuesta = 'warning';
    }
    // Vaciar carrito
    this._items.set([]);
    localStorage.removeItem('carrito');
    return { exito: true, mensaje: mensajeRespuesta, tipo: tipoRespuesta };
  }
}