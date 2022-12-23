import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangePasswordResquest, User } from 'src/app/model/user.model';
import { UserFilter } from 'src/app/model/filter.model';

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
  get(id: number) {
    return this.httpClient.get(`${this.REST_API}/${id}`);
  }
  changePassword(changePasswordResquest: ChangePasswordResquest) {
    return this.httpClient.post(`${this.REST_API}/change-password`, changePasswordResquest);
  }
  // filter(filter: UserFilter) {
  //   let params = new HttpParams();
  //   Object.keys(filter).forEach((key) => {
  //     if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
  //       params = params.append(key, filter[key]);
  //     }
  //   });
  //   return this.httpClient.get(`${this.REST_API}/filter`, { params: params });
  // }
  filter(userFilter: UserFilter) {
    return this.httpClient.post(`${this.REST_API}/filter`, userFilter);
  }
  getTotalOrders() {
    return this.httpClient.get(`${this.REST_API}/total`);
  }
  getTotalOrdersInDay() {
    return this.httpClient.get(`${this.REST_API}/total-in-day`);
  }
}
