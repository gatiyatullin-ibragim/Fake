import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8000/api/orders/';

  constructor(private http: HttpClient) {}

  // Создать заказ из корзины
  createOrder(payload: { items: { product_id: number; quantity: number; name: string; price: number; image: string; brand: string }[] }): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}create/`, payload);
  }

  // Список заказов текущего юзера
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Детали одного заказа
  getOrderDetail(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}${id}/`);
  }
}