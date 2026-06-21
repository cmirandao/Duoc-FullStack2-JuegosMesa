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

  // Para mostrar mensajes de error y manejar el estado de la alerta en vez de usar alert
  alertaCatalogo = signal<{ tipo: 'success' | 'danger', mensaje: string } | null>(null);

  // Mapeo de categorias a sus imagenes
  categoriaConfig: Record<string, string> = {
    'Estrategia': 'cat_estrategia.png',
    'Familiar': 'cat_familiar.png',
    'Cartas': 'cat_cartas.png',
    'Fiesta': 'cat_fiesta.png'
  };

  /*
  *  Obtenemos nombres unicos de forma reactiva iterando sobre el catalogo de juegos. 
  * Actualiza automaticamente si cambia el inventario
  */
  nombresCategorias = computed(() => {
    const lista = this.juegoService.juegos();
    return [...new Set(lista.map(j => j.categoria))];
  });

  getId(nombre: string) { return nombre.toLowerCase().replace(' ', '-'); }

  // Helper para obtener la imagen
  getImg(nombre: string) { return this.categoriaConfig[nombre] || 'default.png'; }

  // Filtra juegos por categoria
  juegosPorCategoria(cat: string) {
    const lista = this.juegoService.juegos();
    return lista.filter(j => j.categoria.trim() === cat.trim());
  }
  /*
  * Controlador de transacciones entre servicios
  * Actualiza inventario y carrito de compras
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

  /*
   * Muestra y oculta el mensaje de alerta
   */
  private mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alertaCatalogo.set({ tipo, mensaje });
    setTimeout(() => {
      this.alertaCatalogo.set(null);
    }, 3000);
  }
}
