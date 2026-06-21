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
  /*
  * Para mostrar mensajes de error y manejar el estado de la alerta en vez de usar alert
  */
  alertaPago = signal<{ tipo: 'success' | 'warning' | 'danger', mensaje: string } | null>(null);

  /*
  *Delega la logica de la transaccion al servicio y redirecciona
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