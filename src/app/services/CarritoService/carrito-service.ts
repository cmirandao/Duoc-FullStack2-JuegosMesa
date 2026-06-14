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
  /* 
   * Estado base del carrito inicializado desde localStorage 
  */
  private _items = signal<Juego[]>(this.cargarCarrito());

  get items() {
    return this._items();
  }
  /* 
   * Calculo del valor total de una compra 
  */
  get total() {
    return this._items().reduce((acc, item) => {
      const precio = parseInt(item.precio.replace(/[^0-9]/g, '')) || 0;
      return acc + precio;
    }, 0);
  }
  /* 
   * Agrupa por juego para indicar el producto y su cantidad 
  */
  itemsAgrupados = computed(() => {
    const mapa = new Map<number, any>();

    this._items().forEach(item => {
      if (mapa.has(item.id)) {
        const existente = mapa.get(item.id);
        existente.cantidad++;
        existente.subtotal = existente.cantidad * parseInt(item.precio.replace(/[^0-9]/g, ''));
      } else {
        mapa.set(item.id, {
          ...item,
          cantidad: 1,
          subtotal: parseInt(item.precio.replace(/[^0-9]/g, ''))
        });
      }
    });
    return Array.from(mapa.values());
  });

  private cargarCarrito(): Juego[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    return JSON.parse(localStorage.getItem('carrito') || '[]');
  }

  agregar(juego: Juego) {
    const carritoActual = this.cargarCarrito();
    const nuevoCarrito = [...carritoActual, juego];
    this.actualizarEstado(nuevoCarrito);
  }
  /*
   * Elimina un item completo desde el carrito y devuelve stock al inventario 
   */
  eliminar(id: number) {
    const cantidadEnCarrito = this._items().filter(i => i.id === id).length;
    if (cantidadEnCarrito > 0) {
      this.juegoService.aumentarStock(id, cantidadEnCarrito);
    }
    this._items.update(items => items.filter(i => i.id !== id));
    this.guardar();
  }

  private guardar() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(this._items()));
    }
  }

  /* 
  * Mantiene todo sincronizado 
  */
  private actualizarEstado(nuevoCarrito: Juego[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      this._items.set(nuevoCarrito);
    }
  }
  /*
  * Manejo de botones de [+] y [-] del carrito
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

  // Elimina solo una instancia del producto en lugar de todos
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
  /*
  * Finaliza el proceso de compra, si existe sesion activa la registra en el historial 
  */
  procesarPago(): boolean {
    const carrito = this._items();
    if (carrito.length === 0) return false;

    const usuario = this.authService.usuarioActual();

    if (usuario) {
      let historial = JSON.parse(localStorage.getItem('historialCompras') || '[]');

      const compra = carrito.map(item => ({
        ...item,
        username: usuario.username,
        fecha: new Date().toLocaleDateString()
      }));

      historial.push(...compra);
      localStorage.setItem('historialCompras', JSON.stringify(historial));
      alert("¡Muchas gracias por tu compra!");
    } else {
      alert("¡Muchas gracias por tu compra! Te invitamos a registrarte y poder llevar el historial de tus compras.");
    }
    // Vaciar carrito
    this._items.set([]);
    localStorage.removeItem('carrito');
    return true;
  }
}