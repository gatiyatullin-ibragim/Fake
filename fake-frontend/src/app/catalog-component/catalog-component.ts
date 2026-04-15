import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart-service';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-component.html',
  styleUrl: './catalog-component.css',
})
export class CatalogComponent implements OnInit {
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
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.errorMessage = 'Не удалось загрузить категории'),
    });
  }

  loadProducts(categorySlug?: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts(categorySlug).subscribe({
      next: (data) => { this.products = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Не удалось загрузить товары.'; this.isLoading = false; },
    });
  }

  onCategoryClick(slug: string | null): void {
    this.selectedCategory = slug;
    this.loadProducts(slug ?? undefined);
  }

  onAddToCart(event: Event, product: Product): void {
    event.preventDefault();
    if (!product.inStock) return;

    // Добавляем без выбора размера (каталог — быстрое добавление, размер S по умолчанию)
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