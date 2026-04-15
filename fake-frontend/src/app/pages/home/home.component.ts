import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { TrackingService } from '../../core/services/tracking-service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private productService = inject(ProductService);
  private trackingService = inject(TrackingService);

  categories = [
    { name: 'Футболки',       slug: 't-shirts',   label: 'SHOP ФУТБОЛКИ'   },
    { name: 'Кроссовки',      slug: 'sneakers',   label: 'SHOP КРОССОВКИ'  },
    { name: 'Верхняя одежда', slug: 'outerwear',  label: 'SHOP ОДЕЖДА'     },
    { name: 'Баскетбол',      slug: 'basketball', label: 'SHOP БАСКЕТБОЛ'  },
    { name: 'Футбол',         slug: 'football',   label: 'SHOP ФУТБОЛ'     },
    { name: 'Шорты',          slug: 'shorts',     label: 'SHOP ШОРТЫ'      },
  ];

  recommendedProducts: Product[] = [];

  constructor() {
    this.productService.getRecommendations(8).subscribe({
      next: (products) => {
        this.recommendedProducts = products;
      },
      error: () => {
        this.recommendedProducts = [];
      },
    });
  }

  onRecommendationClick(productId: number): void {
    this.trackingService.trackClick(productId);
  }
}
