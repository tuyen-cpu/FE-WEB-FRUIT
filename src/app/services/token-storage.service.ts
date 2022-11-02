import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const TOKEN_KEY = 'access-token';
const REFRESHTOKEN_KEY = 'refresh-token';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  userChange = new BehaviorSubject<any>(null);
  constructor() {}

  signOut(): void {
    localStorage.clear();
  }

  public saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveRefreshToken(token: string): void {
    localStorage.setItem(REFRESHTOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }
}
