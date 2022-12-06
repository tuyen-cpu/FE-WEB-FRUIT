import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const TOKEN_KEY = 'access-token';
const REFRESHTOKEN_KEY = 'refresh-token';

@Injectable({
  providedIn: 'root',
})
export class ShareMessageService {
  message = new BehaviorSubject<String>(null);
  constructor() {}
}
