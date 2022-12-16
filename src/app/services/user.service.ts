import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { District, Province } from '../model/province.model';
import { ChangePasswordResquest, User } from '../model/user.model';

@Injectable()
export class UserService {
  private REST_API = 'http://localhost:3000/api/user';
  constructor(private http: HttpClient) {}
  update(user: User): Observable<any> {
    return this.http.put(`${this.REST_API}/update`, user);
  }
  changePassword(changePasswordResquest: ChangePasswordResquest) {
    return this.http.post(`${this.REST_API}/change-password`, changePasswordResquest);
  }
  getRoles(userId: number) {
    return this.http.get(`${this.REST_API}/role?userId=${userId}`);
  }
  // getAll(page: number, size: number) {
  //   return this.http.get(`${this.REST_API}/all?page=${page}&size=${size}`);
  // }
}
