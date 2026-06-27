/**
 * @description Interfaz base que define la estructura y tipado de un juego de mesa.
 */
export interface Juego {
  /** @description Identificador único del juego. */
  id: number;
  /** @description Nombre del juego. */
  nombre: string;
  /** @description Categoría del juego. */
  categoria: string;
  /** @description Precio en pesos chilenos. */
  precio: number;
  /** @description Cantidad de unidades disponibles en stock. */
  stock: number;
  /** @description Descripción del juego. */
  desc: string;
  /** @description Ruta o URL de la imagen del juego. */
  img: string;
  /** @description Indica si el juego actualmente tiene descuento. */
  tieneDescuento: boolean;
  /** @description Texto descriptivo del descuento. */
  textoDescuento: string;
}