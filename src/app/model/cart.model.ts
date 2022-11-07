import { Product } from './category.model';

export interface CartItem {
  product: Product;
  quantity: number;
}
