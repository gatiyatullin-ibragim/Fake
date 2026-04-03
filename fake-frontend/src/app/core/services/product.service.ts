import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api';

  // ─── Mock data (пока бэкенд не готов) ───────────────────────────────────────
  private mockCategories: Category[] = [
    { id: 1, name: 'Футболки',       slug: 't-shirts'   },
    { id: 2, name: 'Шорты',          slug: 'shorts'     },
    { id: 3, name: 'Верхняя одежда', slug: 'outerwear'  },
    { id: 4, name: 'Кроссовки',      slug: 'sneakers'   },
    { id: 5, name: 'Баскетбол',      slug: 'basketball' },
    { id: 6, name: 'Футбол',         slug: 'football'   },
  ];

  private mockProducts: Product[] = [
    // Футболки
    {
      id: 1, name: 'Футболка "Три полоски"',
      description: '100% хлопок, оригинал из Урумчи. Сертификат прилагается.',
      price: 2499, image: 'https://placehold.co/300x300/111/fff?text=Абибас',
      category: this.mockCategories[0], inStock: true, brand: 'Абибас'
    },
    {
      id: 2, name: 'Футболка с галочкой',
      description: 'Just do it... почти. Галочка нарисована вручную мастером.',
      price: 1999, image: 'https://placehold.co/300x300/111/fff?text=Найки',
      category: this.mockCategories[0], inStock: true, brand: 'Найки'
    },
    {
      id: 3, name: 'Футболка "Прыгающая кошка"',
      description: 'Это не Puma. Это Пумо. Почувствуй разницу.',
      price: 2199, image: 'https://placehold.co/300x300/111/fff?text=Пумо',
      category: this.mockCategories[0], inStock: false, brand: 'Пумо'
    },
    // Шорты
    {
      id: 4, name: 'Шорты спортивные "Классик"',
      description: 'Три полоски по бокам. Комфорт 11 из 10.',
      price: 1799, image: 'https://placehold.co/300x300/111/fff?text=Абибас',
      category: this.mockCategories[1], inStock: true, brand: 'Абибас'
    },
    {
      id: 5, name: 'Шорты баскетбольные "Джордан"',
      description: 'Как у Майкла, но доступнее. Намного доступнее.',
      price: 2299, image: 'https://placehold.co/300x300/111/fff?text=Джордан',
      category: this.mockCategories[1], inStock: true, brand: 'Джордан'
    },
    // Верхняя одежда
    {
      id: 6, name: 'Олимпийка "Трёхполосная"',
      description: 'Тёплая олимпийка. Носи с гордостью.',
      price: 4999, image: 'https://placehold.co/300x300/111/fff?text=Абибас',
      category: this.mockCategories[2], inStock: true, brand: 'Абибас'
    },
    {
      id: 7, name: 'Худи с капюшоном "Галочка"',
      description: 'Уютное худи. Логотип нарисован термопринтом.',
      price: 5499, image: 'https://placehold.co/300x300/111/fff?text=Найки',
      category: this.mockCategories[2], inStock: true, brand: 'Найки'
    },
    // Кроссовки
    {
      id: 8, name: 'Кроссовки "Аир Макс"',
      description: 'Воздушная подошва. Почти летаешь. Почти.',
      price: 7999, image: 'https://placehold.co/300x300/111/fff?text=Найки+Аир',
      category: this.mockCategories[3], inStock: true, brand: 'Найки Аир'
    },
    {
      id: 9, name: 'Кроссовки "Буст 500"',
      description: 'Максимальный комфорт, минимальная цена.',
      price: 6999, image: 'https://placehold.co/300x300/111/fff?text=Абибас+Буст',
      category: this.mockCategories[3], inStock: false, brand: 'Абибас Буст'
    },
    // Баскетбол
    {
      id: 10, name: 'Мяч баскетбольный "НБА"',
      description: 'Официальный мяч неофициального чемпионата.',
      price: 3499, image: 'https://placehold.co/300x300/111/fff?text=НБА',
      category: this.mockCategories[4], inStock: true, brand: 'НБА'
    },
    {
      id: 11, name: 'Форма баскетбольная "Джордан"',
      description: 'Как у профи. Цена — не как у профи.',
      price: 4299, image: 'https://placehold.co/300x300/111/fff?text=Джордан',
      category: this.mockCategories[4], inStock: true, brand: 'Джордан'
    },
    // Футбол
    {
      id: 12, name: 'Мяч футбольный "Реал Мадрит"',
      description: 'Мяч чемпионов. Почти официальный.',
      price: 2999, image: 'https://placehold.co/300x300/111/fff?text=Реал+Мадрит',
      category: this.mockCategories[5], inStock: true, brand: 'ФК Реал Мадрит'
    },
    {
      id: 13, name: 'Бутсы "Чемпион"',
      description: 'Забивай голы в правильной обуви. Размеры 36–46.',
      price: 5999, image: 'https://placehold.co/300x300/111/fff?text=Бутсы',
      category: this.mockCategories[5], inStock: true, brand: 'Абибас'
    },
  ];
  // ────────────────────────────────────────────────────────────────────────────

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    // TODO: когда бэкенд готов — раскомментируй:
    // return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
    return of(this.mockCategories);
  }

  getProducts(categorySlug?: string): Observable<Product[]> {
    // TODO: когда бэкенд готов — раскомментируй:
    // const url = categorySlug
    //   ? `${this.apiUrl}/products/?category=${categorySlug}`
    //   : `${this.apiUrl}/products/`;
    // return this.http.get<Product[]>(url);
    if (categorySlug) {
      return of(this.mockProducts.filter(p => p.category.slug === categorySlug));
    }
    return of(this.mockProducts);
  }
}
