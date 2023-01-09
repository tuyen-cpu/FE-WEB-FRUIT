import { Category } from './../../model/category.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export default class AnalyticService {
  REST_API = 'http://localhost:3000/api/admin/analytic';
  constructor(private httpClient: HttpClient) {}

  getWithDayMonthYearBetween(filter: {
    dayStart: number;
    dayEnd: number;
    monthStart: number;
    monthEnd: number;
    yearStart: number;
    yearEnd: number;
    page: number;
    size: number;
  }): Observable<any> {
    let params = new HttpParams();
    Object.keys(filter).forEach((key) => {
      if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
        params = params.append(key, filter[key]);
      }
    });
    return this.httpClient.get(`${this.REST_API}/revenue/day-month-year-between`, { params: params });
  }

  getWithMonthYearBetween(filter: {
    monthStart: number;
    monthEnd: number;
    yearStart: number;
    yearEnd: number;
    page: number;
    size: number;
  }): Observable<any> {
    let params = new HttpParams();
    Object.keys(filter).forEach((key) => {
      if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
        params = params.append(key, filter[key]);
      }
    });
    return this.httpClient.get(`${this.REST_API}/revenue/month-year-between`, { params: params });
  }
}
