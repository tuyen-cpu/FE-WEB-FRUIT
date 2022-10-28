import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  REST_API = 'http://localhost:3000/api/auth';
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
}
