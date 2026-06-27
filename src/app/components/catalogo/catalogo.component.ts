import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { JuegoService } from '../../services/JuegoService/juego-service';
import { AuthService } from '../../services/AuthService/auth-service';
import { CarritoService } from '../../services/CarritoService/carrito-service';
import { Juego } from '../../models/juego.model';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {
  juegoService = inject(JuegoService);
  authService = inject(AuthService);
  carroService = inject(CarritoService);

  /**
   * @description Mensaje de estado para el catálogo.
   */
  alertaCatalogo = signal<{ tipo: 'success' | 'danger', mensaje: string } | null>(null);

  /**
   * @description Mapeo de categorías a nombre de imagen.
   */
  categoriaConfig: Record<string, string> = {
    'Estrategia': 'cat_estrategia.png',
    'Familiar': 'cat_familiar.png',
    'Cartas': 'cat_cartas.png',
    'Fiesta': 'cat_fiesta.png'
  };

  /**
   * @description Obtiene nombres únicos de categorías de forma reactiva.
   * @returns Lista de categorías únicas en el catálogo.
   */
  nombresCategorias = computed(() => {
    const lista = this.juegoService.juegos();
    return [...new Set(lista.map(j => j.categoria))];
  });

  /**
   * @description Genera un identificador HTML válido para una categoría.
   * @param nombre Nombre de la categoría.
   * @returns Identificador en minúsculas sin espacios.
   */
  getId(nombre: string) { return nombre.toLowerCase().replace(' ', '-'); }

  /**
   * @description Devuelve la ruta de imagen asociada a una categoría.
   * @param nombre Nombre de la categoría.
   * @returns Nombre de archivo de imagen.
   */
  getImg(nombre: string) { return this.categoriaConfig[nombre] || 'default.png'; }

  /**
   * @description Filtra el catálogo por categoría.
   * @param cat Categoría de juego.
   * @returns Lista de juegos que pertenecen a la categoría.
   */
  juegosPorCategoria(cat: string) {
    const lista = this.juegoService.juegos();
    return lista.filter(j => j.categoria.trim() === cat.trim());
  }
  /**
   * @description Agrega un juego al carrito y actualiza el inventario del catálogo.
   * @param juego Juego que se añadirá al carrito.
   * @returns void
   */
  agregarAlCarrito(juego: Juego) {
    if (juego.stock > 0) {
      this.juegoService.reducirStock(juego.id);
      this.carroService.agregar(juego);
      this.mostrarAlerta('success', `¡Excelente! Agregaste ${juego.nombre} al carrito.`);
    } else {
      this.mostrarAlerta('danger', 'Lo sentimos, este juego se ha quedado sin stock.');
    }
  }

  /**
   * @description Muestra una alerta temporal en el catálogo.
   * @param tipo Tipo visual de la alerta.
   * @param mensaje Texto que se muestra en la alerta.
   * @returns void
   */
  private mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alertaCatalogo.set({ tipo, mensaje });
    setTimeout(() => {
      this.alertaCatalogo.set(null);
    }, 3000);
  }
}
