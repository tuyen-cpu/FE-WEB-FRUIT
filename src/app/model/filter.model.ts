import { Category } from 'src/app/model/category.model';
import { Payment, ShippingStatus } from './bill.model';

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
  createdAt?: string[];
  categoryId?: number;
  price?: number;
  status?: number;
  page?: number;
  size?: number;
}
export interface OrderFilter {
  createdDate?: string[];
  shippingStatusId?: number;
  address?: string;
  payment?: any;
  page?: number;
  size?: number;
}
