/*
* Interfaz Base
* Define la estructura y el tipado de los datos para los juegos
*/
export interface Juego {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  desc: string;
  img: string;
  tieneDescuento: boolean;
  textoDescuento: string;
}