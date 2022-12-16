import { Category } from './../../model/category.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export default class CategoryManagerService {
  REST_API = 'http://localhost:3000/api/admin/category';
  constructor(private httpClient: HttpClient) {}

  getAll(page: number, size: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/all?page=${page}&size=${size}`);
  }
  add(category: Category) {
    return this.httpClient.post(`${this.REST_API}/add`, category);
  }
}
