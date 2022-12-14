import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { ResponseObject, User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  REST_API = 'http://localhost:3000/api/auth';

  constructor(private httpClient: HttpClient) {}

  verify(code: string): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/verify?code=${code}`);
  }
  getuser(): Observable<any> {
    return this.httpClient.get('http://localhost:3000/api/user/all');
  }
  register(form: any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/process_register`, form);
  }
  login(form: any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/login`, form);
  }
  loginWithGoogle(token: {}): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/google`, token);
  }
  logout(): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/logout`, '');
  }

  forgot(email: string): Observable<any> {
    return this.httpClient.get(
      `${this.REST_API}/forgot-password?email=${email}`
    );
  }

  reset(formReset: { verifyCode: string; password: string }): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/reset-password`, formReset);
  }
  refreshToken(refreshToken: string) {
    return this.httpClient.post(`${this.REST_API}/refreshtoken`, {
      refreshToken: refreshToken,
    });
  }
}
