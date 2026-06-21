import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JuegoService } from '../../../services/JuegoService/juego-service';
import { CarritoService } from '../../../services/CarritoService/carrito-service';
import { Juego } from '../../../models/juego.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private juegoService = inject(JuegoService);
  private carritoService = inject(CarritoService);

  // Signals para manejar el estado de la vista
  juegoActual = signal<Juego | undefined>(undefined);
  cantidadSeleccionada = signal<number>(1);

  ngOnInit() {
    // Extraer el ID de la URL (Ej: /detalle/3 -> id = 3)
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const idNumerico = Number(idParam);
      // Buscar el juego en el inventario actual
      const juegoEncontrado = this.juegoService.juegos().find(j => j.id === idNumerico);
      
      if (juegoEncontrado) {
        this.juegoActual.set(juegoEncontrado);
      } else {
        // Si el usuario inventa un ID en la URL que no existe, se devuelve al catalogo
        this.router.navigate(['/catalogo']);
      }
    }
  }

  // Permite comprar varias unidades de un juego si el stock lo permite
  incrementar() {
    const juego = this.juegoActual();
    // Solo subimos si la cantidad actual es estrictamente menor al stock disponible
    if (juego && this.cantidadSeleccionada() < juego.stock) {
      this.cantidadSeleccionada.update(c => c + 1);
    }
  }

  decrementar() {
    // Nunca se podra comprar menos de 1 unidad
    if (this.cantidadSeleccionada() > 1) {
      this.cantidadSeleccionada.update(c => c - 1);
    }
  }

  agregarMultiplesAlCarrito() {
    const juego = this.juegoActual();
    const cantidad = this.cantidadSeleccionada();

    if (juego && juego.stock >= cantidad) {
      // Se hace un bucle por la cantidad seleccionada para no romper la logica del servicio
      for (let i = 0; i < cantidad; i++) {
        this.juegoService.reducirStock(juego.id);
        this.carritoService.agregar(juego);
      }

      // Actualizar la vista localmente porque el stock global acaba de bajar
      this.juegoActual.set({ ...juego, stock: juego.stock - cantidad });
      
      // Resetear el selector de vuelta a 1
      this.cantidadSeleccionada.set(1);

      // Feedback visual con SweetAlert2
      Swal.fire({
        title: '¡Agregado!',
        text: `Añadiste ${cantidad} unidad(es) de ${juego.nombre} a tu carrito.`,
        icon: 'success',
        confirmButtonColor: '#198754',
        confirmButtonText: 'Seguir comprando'
      });
    }
  }
}