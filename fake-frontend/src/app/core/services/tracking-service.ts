import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private apiUrl = 'http://localhost:8000/api/products/track-click/';

  constructor(private http: HttpClient) {}

  // Шаг 7: вызывается при открытии страницы товара
  trackView(product_id: number): void {
    this.http.post(this.apiUrl, { product_id }).subscribe({
      error: () => {} // молча игнорируем — трекинг не должен ломать UI
    });
  }
}