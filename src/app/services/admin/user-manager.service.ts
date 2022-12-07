import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/model/user.model';

@Injectable({ providedIn: 'root' })
export default class UserManagerService {
  REST_API = 'http://localhost:3000/api/admin/user';
  constructor(private httpClient: HttpClient) {}

  add(user: User) {
    return this.httpClient.post(`${this.REST_API}/add`, user);
  }
  edit(user: User) {
    return this.httpClient.put(`${this.REST_API}/edit`, user);
  }
  getAll(page: number, size: number) {
    return this.httpClient.get(`${this.REST_API}/all?page=${page}&size=${size}`);
  }
}
