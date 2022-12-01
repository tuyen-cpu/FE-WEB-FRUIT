export interface Product {
  id?: number;
  name?: string;
  price?: number;
  description?: string;
  discount?: number;
  quantity?: number;
  status?: number;
  category?: Category;
  image?: Image;
}
export interface ProductRequest {
  id?: number;
  name?: string;
  price?: number;
  description?: string;
  discount?: number;
  quantity?: number;
  status?: number;
  category?: Category;
}
export interface Category {
  id?: number;
  name?: string;
  status?: number;
}

export interface Image {
  id?: number;
  link?: string;
  productId?: number;
}
