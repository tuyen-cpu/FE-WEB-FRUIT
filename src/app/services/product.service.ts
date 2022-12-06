import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../model/category.model';

@Injectable({ providedIn: 'root' })
export default class ProductService {
  REST_API = 'http://localhost:3000/api/product';
  constructor(private httpClient: HttpClient) {}

  getProductByCategorySlugAndPriceLessThan(categorySlug: string, price: number, page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all?categorySlug=${categorySlug}&price=${price}&page=${page}&size=${size}`);
  }
  search(key: string, page: number = 0, size: number = 10): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/search?key=${key}&page=${page}&size=${size}`);
  }
  getById(id: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${id}`);
  }
  getBySlug(slug: string): Observable<any> {
    return this.httpClient.get(`${this.REST_API}?slug=${slug}`);
  }
}
