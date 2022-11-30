import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductRequest } from 'src/app/model/category.model';

@Injectable({ providedIn: 'root' })
export default class ProductManagerService {
  REST_API = 'http://localhost:3000/api/admin/product';
  constructor(private httpClient: HttpClient) {}

  getProductByCategoryIdAndPriceLessThan(categoryId: number = 0, price: number, page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all?categoryId=${categoryId}&price=${price}&page=${page}&size=${size}`);
  }
  add(form: FormData) {
    return this.httpClient.post(`${this.REST_API}/add`, form);
  }
}
