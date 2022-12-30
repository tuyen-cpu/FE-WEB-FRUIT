import { Checkout, Order } from './../model/bill.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderFilter } from '../model/filter.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  REST_API = 'http://localhost:3000/api/order';

  constructor(private httpClient: HttpClient) {}
  checkout(checkout: Checkout): Observable<any> {
    return this.httpClient.post(`${this.REST_API}`, checkout);
  }
  getAllByUserId(userId: number, page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all/${userId}?page=${page}&size=${size}`);
  }
  getAllById(id: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${id}`);
  }
  setCancel(order: Order): Observable<any> {
    return this.httpClient.put(`${this.REST_API}/update-shipping-status`, order);
  }
  filter(filter: OrderFilter) {
    return this.httpClient.post(`${this.REST_API}/filter`, filter);
  }
}
