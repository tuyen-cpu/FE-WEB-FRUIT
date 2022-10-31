import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { ResponseObject, User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  REST_API = 'http://localhost:3000/api/auth';
  userChange = new BehaviorSubject<any>(null);
  constructor(private httpClient: HttpClient) {}

  verify(code: string): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/verify?code=${code}`);
  }
  register(form: any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/process_register`, form);
  }
  login(form: any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/login`, form);
  }
  logout(): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/logout`, '');
  }
  refreshToken() {
    return this.httpClient.post(`${this.REST_API}/refreshtoken`, {});
  }
}
