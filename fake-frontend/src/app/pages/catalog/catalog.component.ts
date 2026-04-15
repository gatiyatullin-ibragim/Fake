import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart-service';
import { TrackingService } from '../../core/services/tracking-service';
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
  recommendedProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string | null = null;
  searchTerm = '';
  isLoading = true;
  errorMessage = '';
  addedProductId: number | null = null;
  currentPage = 1;
  pageSize = 24;
  totalCount = 0;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private trackingService: TrackingService,
  ) {}

  ngOnInit(): void {
    this.buildCategories();
    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = (params.get('q') || '').trim();
      this.selectedCategory = (params.get('category') || '').trim() || null;
      const rawPage = Number(params.get('page') || '1');
      const rawPageSize = Number(params.get('page_size') || String(this.pageSize));
      this.currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      this.pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0
        ? Math.min(rawPageSize, 48)
        : 24;
      this.loadCatalogData(this.searchTerm, this.selectedCategory, this.currentPage);
    });
  }

  loadCatalogData(searchTerm = '', categorySlug: string | null = null, page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadRecommendations(categorySlug);
    this.productService.getProductsPage({
      categorySlug,
      searchQuery: searchTerm,
      page,
      pageSize: this.pageSize,
    }).subscribe({
      next: (response) => {
        this.products = response.results;
        this.currentPage = response.page;
        this.totalCount = response.count;
        this.totalPages = Math.max(1, Math.ceil(response.count / response.pageSize));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить товары. Попробуйте позже.';
        this.isLoading = false;
      },
    });
  }

  loadRecommendations(categorySlug: string | null = null): void {
    this.productService.getRecommendations(3).subscribe({
      next: (data) => {
        this.recommendedProducts = categorySlug
          ? data.filter((product) => product.category.slug === categorySlug)
          : data;
      },
      error: () => {
        this.recommendedProducts = [];
      },
    });
  }

  buildCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  onCategoryClick(slug: string | null): void {
    if (!slug) {
      this.router.navigate(['/catalog'], {
        queryParams: {
          ...(this.searchTerm ? { q: this.searchTerm } : {}),
          page: 1,
          page_size: this.pageSize,
        },
      });
      return;
    }

    this.router.navigate(['/catalog'], {
      queryParams: {
        ...(this.searchTerm ? { q: this.searchTerm } : {}),
        category: slug,
        page: 1,
        page_size: this.pageSize,
      },
    });
  }

  onPageChange(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages || nextPage === this.currentPage) {
      return;
    }

    this.router.navigate(['/catalog'], {
      queryParams: {
        ...(this.searchTerm ? { q: this.searchTerm } : {}),
        ...(this.selectedCategory ? { category: this.selectedCategory } : {}),
        page: nextPage,
        page_size: this.pageSize,
      },
    });
  }

  onAddToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();

    if (!product.inStock) return;

    this.cartService.addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      size: 'M',
    });

    this.trackingService.trackClick(product.id);

    this.addedProductId = product.id;
    setTimeout(() => (this.addedProductId = null), 1500);
  }

  onOpenProduct(productId: number): void {
    this.trackingService.trackClick(productId);
  }
}
