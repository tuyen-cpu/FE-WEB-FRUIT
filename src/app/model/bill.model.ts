import { Address } from './address.model';
import { Product } from './category.model';

export interface Checkout {
  id?: number;
  shippingCost?: number;
  description?: string;
  address?: string;
  fullName?: string;
  phone?: string;
  userId?: number;
  orderDetails?: OrderDetail[];
  payment?: Payment;
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
  id?: number;
  createdBy?: string;
  total?: number;
  createdDate?: Date;
  shippingStatus?: ShippingStatus;
  address?: string;
  fullName?: string;
  phone?: string;
  payment?: Payment;
  orderDetails: OrderDetail[];
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
export interface Payment {
  id?: number;
  status?: EStatusPayment;
  payer?: string;
  paymentMethod?: PaymentMethod;
  email?: string;
}
export enum PaymentMethod {
  COD = 'COD',
  PAYPAL = 'PAYPAL',
}
export enum EStatusPayment {
  PAID,
  UNPAID,
}
