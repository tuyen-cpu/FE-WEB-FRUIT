import { Checkout } from './../model/bill.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  REST_API = 'http://localhost:3000/api/order';
  constructor(private httpClient: HttpClient) {}
  checkout(checkout: Checkout): Observable<any> {
    return this.httpClient.post(`${this.REST_API}`, checkout);
  }
}