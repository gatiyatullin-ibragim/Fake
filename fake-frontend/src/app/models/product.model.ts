import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  generatedImages?: string[];
  category: Category;
  inStock: boolean;
  brand: string;
  tags?: string[];
}