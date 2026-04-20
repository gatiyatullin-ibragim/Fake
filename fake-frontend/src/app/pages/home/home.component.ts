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
    { name: 'T Shirts',  slug: 't-shirts',  label: 'SHOP T SHIRTS'  },
    { name: 'Sneakers',  slug: 'sneakers',  label: 'SHOP SNEAKERS'  },
    { name: 'Outerwear', slug: 'outerwear', label: 'SHOP OUTERWEAR' },
    { name: 'Shorts',    slug: 'shorts',    label: 'SHOP SHORTS'    },
  ];

  recommendedProducts: Product[] = [];

  constructor() {
    this.productService.getRecommendations(3).subscribe({
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
