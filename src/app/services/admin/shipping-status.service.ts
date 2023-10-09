import { Category } from './../../model/category.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export default class ShippingStatusService {
  REST_API = 'http://localhost:3000/api/admin/shipping-status';
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all`);
  }
}
