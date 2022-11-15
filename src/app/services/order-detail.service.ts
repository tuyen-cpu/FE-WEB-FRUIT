import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderDetailService {
  REST_API = 'http://localhost:3000/api/order-detail';
  constructor(private httpClient: HttpClient) {}
  getByOrderId(orderId: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${orderId}`);
  }
}
