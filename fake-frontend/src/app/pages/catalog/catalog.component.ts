import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private productService: ProductService) {}

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
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить товары. Попробуйте позже.';
        this.isLoading = false;
      },
    });
  }

  // click event #1 — фильтр по категории
  onCategoryClick(slug: string | null): void {
    this.selectedCategory = slug;
    this.loadProducts(slug ?? undefined);
  }

  // click event #2 — кнопка "В корзину" (заглушка до реализации корзины)
  onAddToCart(product: Product): void {
    console.log('Добавлено в корзину:', product.name);
    alert(`"${product.name}" добавлен в корзину!`);
  }
}
