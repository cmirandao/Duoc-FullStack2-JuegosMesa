import { Injectable, signal, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Juego } from '../../models/juego.model';

@Injectable({ providedIn: 'root' })
export class JuegoService {
  /**
   * @description Identifica si el código se ejecuta en el navegador o en SSR.
   */
  private platformId = inject(PLATFORM_ID);
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
    const iniciales = this.obtenerJuegosIniciales().map((j, i) => ({ ...j, id: i + 1 }));
    this._juegos.set(iniciales as Juego[]);
    this.persistir();
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
  /**
   * @description Devuelve el inventario base de juegos iniciales.
   * @returns Lista de juegos sin campo id.
   */
  private obtenerJuegosIniciales(): Omit<Juego, 'id'>[] {
    return [
      { nombre: "Catán", categoria: "Estrategia", precio: 45000, stock: 50, desc: "Construye rutas y poblados negociando recursos.", img: "img/catan.jpg", tieneDescuento: true, textoDescuento: "¡10% de descuento!" },
      { nombre: "Scythe", categoria: "Estrategia", precio: 85000, stock: 23, desc: "Estrategia 4X en una Europa alternativa.", img: "img/scythe.jpg", tieneDescuento: true, textoDescuento: "¡Envío Gratis!" },
      { nombre: "Terraforming Mars", categoria: "Estrategia", precio: 65000, stock: 20, desc: "Dirige una corporación para hacer habitable el planeta rojo. Complejo e inmersivo.", img: "img/terraforming-mars.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Carcassonne", categoria: "Familiar", precio: 35000, stock: 1, desc: "Crea un mapa medieval con losetas.", img: "img/carcassonne.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Aventureros al Tren", categoria: "Familiar", precio: 50000, stock: 10, desc: "Conecta ciudades norteamericanas con tus rutas de trenes. Diversión para todos.", img: "img/aventureros.jpg", tieneDescuento: true, textoDescuento: "¡15% de descuento por esta semana!" },
      { nombre: "Dixit", categoria: "Familiar", precio: 38000, stock: 10, desc: "Un juego de deducción y creatividad donde una imagen vale mil palabras.", img: "img/dixit.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Exploding Kittens", categoria: "Cartas", precio: 20000, stock: 5, desc: "Una versión gatuna de la ruleta rusa. Roba cartas hasta que  alguien explote.", img: "img/exploding.jpeg", tieneDescuento: true, textoDescuento: "¡20% Dcto en segunda unidad!" },
      { nombre: "Virus!", categoria: "Cartas", precio: 15000, stock: 30, desc: "Contagia los órganos de tus rivales y protege los tuyos en este rápido juego.", img: "img/virus.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Sushi Go!", categoria: "Cartas", precio: 18000, stock: 40, desc: "Pasa y escoge cartas para crear el mejor menú de sushi. Rápido y divertido.", img: "img/sushi-go.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Código Secreto", categoria: "Fiesta", precio: 25000, stock: 3, desc: "Encuentra agentes usando pistas.", img: "img/codigo-secreto.jpg", tieneDescuento: true, textoDescuento: "¡10% Dcto!" },
      { nombre: "Just One", categoria: "Fiesta", precio: 22000, stock: 2, desc: "Juego cooperativo donde debes escribir una pista para adivinar la palabra secreta.", img: "img/just-one.jpg", tieneDescuento: false, textoDescuento: "Precio normal." },
      { nombre: "Dobble", categoria: "Fiesta", precio: 15000, stock: 1, desc: "Pon a prueba tus reflejos visuales encontrando el símbolo idéntico.", img: "img/dobble.jpg", tieneDescuento: false, textoDescuento: "Precio normal." }
    ];
  }
}