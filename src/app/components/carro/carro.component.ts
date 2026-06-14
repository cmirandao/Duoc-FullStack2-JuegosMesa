import { Component, inject } from '@angular/core';
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
  *Delega la logica de la transaccion al servicio y redirecciona
  */
  pagar() {
  const exito = this.carritoService.procesarPago();
  if (exito) {
    this.router.navigate(['/']); 
  }
}
}