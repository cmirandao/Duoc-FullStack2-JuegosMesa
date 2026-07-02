import { Injectable, signal, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Juego } from '../../models/juego.model';

@Injectable({ providedIn: 'root' })
export class JuegoService {
  /**
   * @description Identifica si el código se ejecuta en el navegador o en SSR.
   */
  private platformId = inject(PLATFORM_ID);
  /**
   * @description Cliente HTTP para consumir APIs externas.
   */
  private http = inject(HttpClient);

  /**
   * @description URL de la API Rest simulada en GitHub Pages.
   */
  private apiUrl = 'https://cmirandao.github.io/Duoc-api-juegos-mesa/juegos.json';
  /**
   * @description Estado reactivo interno para gestionar el catálogo de juegos.
   */
  private _juegos = signal<Juego[]>([]);
  juegos = this._juegos.asReadonly();

  constructor() {
    /**
     * @description afterNextRender garantiza que el código de localStorage se ejecute solo en el browser.
     */
    afterNextRender(() => {
      const guardados = localStorage.getItem('juegos');

      if (guardados) {
        try {
          this._juegos.set(JSON.parse(guardados));
        } catch (e) {
          console.error("Error al leer localStorage", e);
          this.inicializarDatos();
        }
      } else {
        this.inicializarDatos();
      }
    });
  }
  /**
   * @description Carga el catálogo por defecto la primera vez que se inicia la app.
   * @returns void
   */
  private inicializarDatos() {
    this.http.get<Juego[]>(this.apiUrl).subscribe({
      next: (datosExtraidos) => {
        const iniciales = datosExtraidos.map((j, i) => ({ ...j, id: i + 1 }));
        
        // Actualizar la Signal y guardar en localStorage
        this._juegos.set(iniciales);
        this.persistir();
      },
      error: (error) => {
        console.error('Error al consumir el archivo JSON de GitHub Pages:', error);
        // Para evitar fallos , inicializar la lista vacia si no se carga el json
        this._juegos.set([]);
      }
    });
  }

  /**
   * @description Sincroniza el estado del signal con el localStorage.
   * @returns void
   */
  private persistir() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('juegos', JSON.stringify(this._juegos()));
    }
  }

  /**
   * @description Reduce en 1 el stock del juego identificado.
   * @param id Identificador del juego.
   * @returns void
   */
  reducirStock(id: number) {
    this._juegos.update(lista => lista.map(j => j.id === id ? { ...j, stock: j.stock - 1 } : j));
    this.persistir();
  }
  /**
   * @description Aumenta el stock de un juego en la cantidad indicada.
   * @param id Identificador del juego.
   * @param cantidad Cantidad de stock a sumar.
   * @returns void
   */
  aumentarStock(id: number, cantidad: number = 1) {
    this._juegos.update(lista => lista.map(j => 
      j.id === id ? { ...j, stock: j.stock + cantidad } : j
    ));
    this.persistir();
  }
  /**
   * @description Agrega un juego al carrito si hay stock disponible y actualiza el inventario.
   * @param id Identificador del juego.
   * @returns Objeto con estado y mensaje del intento.
   */
  agregarAlCarrito(id: number) {
    const juego = this._juegos().find(j => j.id === id);

    if (juego && juego.stock > 0) {
      this._juegos.update(lista => lista.map(j =>
        j.id === id ? { ...j, stock: j.stock - 1 } : j
      ));

      this.persistir();

      if (isPlatformBrowser(this.platformId)) {
        let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        carrito.push({ ...juego, stock: 1 });
        localStorage.setItem('carrito', JSON.stringify(carrito));
      }

      return { exito: true, mensaje: `Agregado al carrito: ${juego.nombre}` };
    } else {
      return { exito: false, mensaje: "Lo sentimos, no hay stock disponible." };
    }
  }
  /**
   * @description Elimina completamente un juego del catálogo.
   * @param id Identificador del juego a eliminar.
   * @returns void
   */
  eliminarJuego(id: number) {
    this._juegos.update(lista => lista.filter(j => j.id !== id));
    this.persistir();
  }
}