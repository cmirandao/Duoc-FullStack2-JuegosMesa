import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/CarritoService/carrito-service';

@Component({
  selector: 'app-carro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carro.component.html'
})
export class CarroComponent {
  carritoService = inject(CarritoService);
  router = inject(Router);
  /**
   * @description Mensaje de estado para el proceso de pago.
   */
  alertaPago = signal<{ tipo: 'success' | 'warning' | 'danger', mensaje: string } | null>(null);

  /**
   * @description Realiza el pago mediante el servicio de carrito, registra la compra y redirige al inicio.
   * @returns void
   */
  pagar() {
    const resultado = this.carritoService.procesarPago();
    if (resultado.exito) {
      this.alertaPago.set({ tipo: resultado.tipo, mensaje: resultado.mensaje });
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2500);
    } else {
      this.alertaPago.set({ tipo: 'danger', mensaje: resultado.mensaje });
      setTimeout(() => this.alertaPago.set(null), 3000);
    }
  }
}