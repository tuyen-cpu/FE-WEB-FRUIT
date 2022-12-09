export interface UserFilter {
  email?: string;
  firstName?: string;
  lastName?: string;
  role_name?: string;
  status?: number;
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
