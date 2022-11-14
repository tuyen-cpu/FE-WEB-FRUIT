import { Address } from './address.model';

export interface Checkout {
  id?: number;
  shippingCost?: number;
  description?: string;
  address?: Address;
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
