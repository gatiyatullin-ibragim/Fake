import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'fake_cart';

  // Реактивное состояние корзины
  private _items = signal<CartItem[]>(this.loadFromStorage());

  // Публичные вычисляемые значения
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  // ─── Добавить товар ────────────────────────────────────────────
  addItem(item: Omit<CartItem, 'quantity'>): void {
    const current = this._items();
    const key = `${item.product_id}-${item.size}`;
    const existing = current.find(i => `${i.product_id}-${i.size}` === key);

    if (existing) {
      this._items.set(current.map(i =>
        `${i.product_id}-${i.size}` === key
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      this._items.set([...current, { ...item, quantity: 1 }]);
    }
    this.saveToStorage();
  }

  // ─── Изменить количество ───────────────────────────────────────
  updateQuantity(product_id: number, size: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(product_id, size);
      return;
    }
    this._items.set(this._items().map(i =>
      i.product_id === product_id && i.size === size ? { ...i, quantity } : i
    ));
    this.saveToStorage();
  }

  // ─── Удалить позицию ──────────────────────────────────────────
  removeItem(product_id: number, size: string): void {
    this._items.set(this._items().filter(
      i => !(i.product_id === product_id && i.size === size)
    ));
    this.saveToStorage();
  }

  // ─── Очистить корзину ─────────────────────────────────────────
  clear(): void {
    this._items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ─── Подготовить payload для create_order ─────────────────────
  toOrderPayload(): { items: { product_id: number; quantity: number; name: string; price: number; image: string; brand: string }[] } {
    return {
      items: this._items().map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        name: i.name,
        price: i.price,
        image: i.image,
        brand: i.brand,
      })),
    };
  }

  // ─── localStorage ─────────────────────────────────────────────
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }
}