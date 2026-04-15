import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private trackViewUrl = 'http://localhost:8000/api/products/track-view/';
  private trackClickUrl = 'http://localhost:8000/api/products/track-click/';

  constructor(private http: HttpClient) {}

  // Трекинг просмотров и кликов выполняется только в браузере.
  trackView(product_id: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.http.post(this.trackViewUrl, { product_id }).subscribe({
      error: () => {} // трекинг не должен ломать UI
    });
  }

  trackClick(product_id: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.http.post(this.trackClickUrl, { product_id }).subscribe({
      error: () => {} // молча игнорируем — трекинг не должен ломать UI
    });
  }
}