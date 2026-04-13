export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  price: string;
  quantity: number;
  cost: string;
  image: string;
}

export interface Order {
  id: number;
  status: 'pending' | 'completed' | 'cancelled';
  is_paid: boolean;
  total_price: string;
  created_at: string;
  items_count: number;
  items?: OrderItem[];
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  quantity: number;
  size: string;
}