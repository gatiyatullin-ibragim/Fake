import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart-service';
import { TrackingService } from '../../core/services/tracking-service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  similarProducts: Product[] = [];
  isLoading = true;
  errorMessage = '';
  selectedSize: string | null = null;
  addedToCart = false;

  // Галерея: активный индекс и массив фото
  activeImageIndex = 0;
  images: string[] = [];

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  specs = [
    { label: 'Материал',      value: '100% хлопок (почти)'  },
    { label: 'Производитель', value: 'Урумчи, Китай'         },
    { label: 'Сезон',         value: 'Всесезонный'           },
    { label: 'Гарантия',      value: '7 дней'                },
    { label: 'Оригинал',      value: '99% — доверяй нам'     },
  ];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private trackingService: TrackingService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        // Собираем галерею: основное фото + плейсхолдеры для остальных
        // Здесь пока условные фото в дальнейшем будут нормальные фотографии
        this.images = [
          data.image,
          `https://placehold.co/600x600/1a1a1a/fff?text=Фото+2`,
          `https://placehold.co/600x600/222/fff?text=Фото+3`,
          `https://placehold.co/600x600/333/fff?text=Фото+4`,
        ];

        this.trackingService.trackView(id);
        this.loadSimilarProducts(id);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Товар не найден';
        this.isLoading = false;
      }
    });
  }

  loadSimilarProducts(id: number): void {
    this.productService.getSimilarProducts(id).subscribe({
      next: (products) => {
        this.similarProducts = products;
      },
      error: () => {
        this.similarProducts = [];
      },
    });
  }

  // Выбор фото по индексу (клик на thumbnail)
  selectImage(index: number): void {
    this.activeImageIndex = index;
  }

  // Стрелки вперёд / назад
  prevImage(): void {
    this.activeImageIndex =
      (this.activeImageIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage(): void {
    this.activeImageIndex =
      (this.activeImageIndex + 1) % this.images.length;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  onAddToCart(): void {
    if (!this.selectedSize || !this.product) return;

    this.cartService.addItem({
      product_id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.image,
      brand: this.product.brand,
      size: this.selectedSize,
    });

    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 2500);
  }
}
