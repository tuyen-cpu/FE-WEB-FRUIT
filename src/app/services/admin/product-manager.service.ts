import { ProductFilter } from 'src/app/model/filter.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  filter(filter: ProductFilter) {
    // let params = new HttpParams();
    // Object.keys(filter).forEach((key) => {
    //   if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
    //     params = params.append(key, filter[key]);
    //   }
    // });
    return this.httpClient.post(`${this.REST_API}/filter`, filter);
  }
}
