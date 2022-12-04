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
}
