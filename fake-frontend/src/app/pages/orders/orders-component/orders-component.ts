import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order-service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-component.html',
  styleUrl: './orders-component.css',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  isLoadingDetail = false;
  errorMessage = '';

  statusLabel: Record<string, string> = {
    pending:   'В обработке',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => { this.orders = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Не удалось загрузить заказы'; this.isLoading = false; },
    });
  }

  openDetail(order: Order): void {
    if (this.selectedOrder?.id === order.id) {
      this.selectedOrder = null;
      return;
    }
    this.isLoadingDetail = true;
    this.orderService.getOrderDetail(order.id).subscribe({
      next: (data) => { this.selectedOrder = data; this.isLoadingDetail = false; },
      error: () => { this.isLoadingDetail = false; },
    });
  }
}