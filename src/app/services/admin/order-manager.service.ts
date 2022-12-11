import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export default class OrderManagerService {
  REST_API = 'http://localhost:3000/api/admin/order';
  constructor(private httpClient: HttpClient) {}

  getAll(page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all?page=${page}&size=${size}`);
  }
}
