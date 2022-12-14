import { OrderFilter } from './../../model/filter.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order } from 'src/app/model/bill.model';

@Injectable()
export default class OrderManagerService {
  REST_API = 'http://localhost:3000/api/admin/order';
  constructor(private httpClient: HttpClient) {}

  getAll(page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all?page=${page}&size=${size}`);
  }
  filter(filter: OrderFilter) {
    // let params = new HttpParams();
    // Object.keys(filter).forEach((key) => {
    //   if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
    //     params = params.append(key, filter[key]);
    //   }
    // });
    return this.httpClient.post(`${this.REST_API}/filter`, filter);
  }
  updateStatus(order: Order) {
    return this.httpClient.post(`${this.REST_API}/update-status`, order);
  }
  getTotalOrders() {
    return this.httpClient.get(`${this.REST_API}/total`);
  }
  getTotalOrdersInDay() {
    return this.httpClient.get(`${this.REST_API}/total-in-day`);
  }
  getRevenue() {
    return this.httpClient.get(`${this.REST_API}/revenue`);
  }
  getRevenueLastMonth() {
    return this.httpClient.get(`${this.REST_API}/revenue-last-month`);
  }
  getRevenueCurrentMonth() {
    return this.httpClient.get(`${this.REST_API}/revenue-current-month`);
  }
  getStatisticalShippingStatus() {
    return this.httpClient.get(`${this.REST_API}/statistical-shipping-status`);
  }
  getByOrderId(orderId: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${orderId}/order-detail`);
  }
}
