import { Address } from './address.model';
import { Product } from './category.model';

export interface Checkout {
  id?: number;
  shippingCost?: number;
  description?: string;
  address?: string;
  userId?: number;
  orderDetails?: OrderDetail[];
}
export interface OrderDetail {
  id?: number;
  price: number;
  quantity: number;
  discount: number;
  productId: number;
  billId?: number;
}
export interface Order {
  id: number;
  total: number;
  createdDate: Date;
  shippingStatus: ShippingStatus;
  address: string;
}
export interface ShippingStatus {
  id: number;
  name: string;
}
export interface OrderDetailRequest {
  id: number;
  price: number;
  quantity: number;
  discount: number;
  product: Product;
}
