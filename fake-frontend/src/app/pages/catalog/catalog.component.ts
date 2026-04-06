import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
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

  onCategoryClick(slug: string | null): void {
    this.selectedCategory = slug;
    this.loadProducts(slug ?? undefined);
  }

  onAddToCart(product: Product): void {
    alert(`"${product.name}" добавлен в корзину!`);
  }
}
