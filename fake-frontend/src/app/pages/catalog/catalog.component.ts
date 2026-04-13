import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart-service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  allProducts: Product[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string | null = null;
  isLoading = true;
  errorMessage = '';
  addedProductId: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadCatalogData();
  }

  loadCatalogData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.products = data;
        this.buildCategories(data);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить товары. Попробуйте позже.';
        this.isLoading = false;
      },
    });
  }

  buildCategories(products: Product[]): void {
    const map = new Map<string, Category>();
    for (const product of products) {
      if (!map.has(product.category.slug)) {
        map.set(product.category.slug, {
          id: map.size + 1,
          name: product.category.name,
          slug: product.category.slug,
        });
      }
    }
    this.categories = Array.from(map.values());
  }

  onCategoryClick(slug: string | null): void {
    this.selectedCategory = slug;
    if (!slug) {
      this.products = this.allProducts;
      return;
    }
    this.products = this.allProducts.filter((p) => p.category.slug === slug);
  }

  onAddToCart(product: Product): void {
    if (!product.inStock) return;

    this.cartService.addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      size: 'M',
    });

    this.addedProductId = product.id;
    setTimeout(() => (this.addedProductId = null), 1500);
  }
}
