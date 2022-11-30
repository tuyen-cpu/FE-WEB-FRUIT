import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image } from '../model/category.model';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  REST_API = 'http://localhost:3000/api/image';
  constructor(private httpClient: HttpClient) {}

  getByProductId(productId: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}?productId=${productId}`);
  }
  getAllByProductId(productId: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${productId}`);
  }
  add(images: Image[]) {
    return this.httpClient.post(`${this.REST_API}/add`, images);
  }
}
