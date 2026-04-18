import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

interface ProductApiModel {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image: string;
  generated_images?: string[];
  category?: { name: string; slug: string };
  in_stock: boolean;
  brand: string;
  tags?: string[];
}

interface PaginatedProductApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  results: ProductApiModel[];
}

export interface PaginatedProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  pageSize: number;
  results: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private mapProduct(apiProduct: ProductApiModel): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: Number(apiProduct.price),
      image: apiProduct.image,
      generatedImages: apiProduct.generated_images || [],
      category: apiProduct.category
        ? { id: 0, name: apiProduct.category.name, slug: apiProduct.category.slug }
        : { id: 0, name: 'Прочее', slug: 'misc' },
      inStock: apiProduct.in_stock,
      brand: apiProduct.brand,
      tags: apiProduct.tags || [],
    };
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/products/categories/`);
  }

  getProductsPage(options?: {
    categorySlug?: string | null;
    searchQuery?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedProductsResponse> {
    const categorySlug = options?.categorySlug || '';
    const searchQuery = options?.searchQuery || '';
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 24;

    const query = (searchQuery || '').trim();
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (query) {
      params.set('q', query);
    }
    if (categorySlug.trim()) {
      params.set('category', categorySlug.trim());
    }

    return this.http
      .get<PaginatedProductApiResponse>(`${this.apiUrl}/products/?${params.toString()}`)
      .pipe(
        map((response) => ({
          count: response.count,
          next: response.next,
          previous: response.previous,
          page: response.page,
          pageSize: response.page_size,
          results: response.results.map((item) => this.mapProduct(item)),
        }))
      );
  }

  getProducts(categorySlug?: string, searchQuery?: string): Observable<Product[]> {
    return this.getProductsPage({
      categorySlug,
      searchQuery,
      page: 1,
      pageSize: 200,
    }).pipe(
      map((response) => response.results)
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<ProductApiModel>(`${this.apiUrl}/products/${id}/`)
      .pipe(map((item) => this.mapProduct(item)));
  }

  getSimilarProducts(id: number): Observable<Product[]> {
    return this.http
      .get<ProductApiModel[]>(`${this.apiUrl}/products/similar/${id}/`)
      .pipe(map((items) => items.map((item) => this.mapProduct(item))));
  }

  getRecommendations(limit = 3, interests?: string): Observable<Product[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (interests?.trim()) {
      params.set('interests', interests.trim());
    }

    return this.http
      .get<ProductApiModel[]>(`${this.apiUrl}/products/recommendations/?${params.toString()}`)
      .pipe(map((items) => items.map((item) => this.mapProduct(item))));
  }
}
