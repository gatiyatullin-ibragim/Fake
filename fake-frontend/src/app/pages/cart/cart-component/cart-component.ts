import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart-service';
import { OrderService } from '../../../core/services/order-service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  router = inject(Router);

  isOrdering = false;
  orderSuccess = false;
  errorMessage = '';

  items = this.cartService.items;
  total = this.cartService.total;
  count = this.cartService.count;
  isLoggedIn = computed(() => !!this.authService.user());

  updateQuantity(product_id: number, size: string, quantity: number): void {
    this.cartService.updateQuantity(product_id, size, quantity);
  }

  removeItem(product_id: number, size: string): void {
    this.cartService.removeItem(product_id, size);
  }

  checkout(): void {
    if (this.cartService.items().length === 0) return;
    if (!this.isLoggedIn()) {
      this.errorMessage = 'Для оформления заказа войдите в профиль.';
      this.router.navigate(['/login']);
      return;
    }

    this.isOrdering = true;
    this.errorMessage = '';

    this.orderService.createOrder(this.cartService.toOrderPayload()).subscribe({
      next: (order) => {
        this.cartService.clear();
        this.orderSuccess = true;
        this.isOrdering = false;
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: (error) => {
        this.errorMessage = error?.message || 'Ошибка при оформлении заказа. Попробуйте снова.';
        this.isOrdering = false;
      },
    });
  }
}