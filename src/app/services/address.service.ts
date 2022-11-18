import { Address } from 'src/app/model/address.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  REST_API = 'http://localhost:3000/api/address';
  constructor(private http: HttpClient) {}
  getByUserId(userId: number, page: number, size: number): Observable<any> {
    return this.http.get(
      `${this.REST_API}/${userId}?page=${page}&size=${size}`
    );
  }
  add(address: Address): Observable<any> {
    return this.http.post(`${this.REST_API}/add`, address);
  }
  update(address: Address): Observable<any> {
    return this.http.put(`${this.REST_API}/update`, address);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.REST_API}/delete/${id}`);
  }
}
