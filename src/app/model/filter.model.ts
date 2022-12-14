import { ShippingStatus } from './bill.model';

export interface UserFilter {
  status?: number;
  role?: string;
  createdAt?: string[];
  email?: string;
  page?: number;
  size?: number;
}
export interface ProductFilter {
  name?: string;
  quantity?: number;
  discount?: number;
  price?: number;
  status?: number;
  page?: number;
  size?: number;
}
export interface OrderFilter {
  createdDate?: any;
  shippingStatus_id?: number;
  address?: string;
  // payment?: Payment;
  page?: number;
  size?: number;
}
