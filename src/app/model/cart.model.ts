import { Product } from './category.model';

export interface CartItem {
  id?: number;
  quantity: number;
  product: Product;
  userId?: number;
}
