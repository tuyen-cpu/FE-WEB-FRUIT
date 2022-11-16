import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  REST_API = 'http://localhost:3000/api/address';
  constructor(private http: HttpClient) {}
  getByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.REST_API}/${userId}`);
  }
}
