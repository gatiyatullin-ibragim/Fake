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
  category?: { name: string; slug: string };
  in_stock: boolean;
  brand: string;
  tags?: string[];
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
      category: apiProduct.category
        ? { id: 0, name: apiProduct.category.name, slug: apiProduct.category.slug }
        : { id: 0, name: 'Прочее', slug: 'misc' },
      inStock: apiProduct.in_stock,
      brand: apiProduct.brand,
      tags: apiProduct.tags || [],
    };
  }

  getCategories(): Observable<Category[]> {
    return this.getProducts().pipe(
      map((products) => {
        const unique = new Map<string, Category>();
        for (const p of products) {
          if (!unique.has(p.category.slug)) {
            unique.set(p.category.slug, {
              id: unique.size + 1,
              name: p.category.name,
              slug: p.category.slug,
            });
          }
        }
        return Array.from(unique.values());
      })
    );
  }

  getProducts(categorySlug?: string, searchQuery?: string): Observable<Product[]> {
    const query = (searchQuery || '').trim();
    const url = query
      ? `${this.apiUrl}/products/?q=${encodeURIComponent(query)}`
      : `${this.apiUrl}/products/`;

    return this.http.get<ProductApiModel[]>(url).pipe(
      map((items) => items.map((item) => this.mapProduct(item))),
      map((items) => categorySlug ? items.filter((p) => p.category.slug === categorySlug) : items)
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
}
