import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
const TOKEN_KEY = 'access-token';
const REFRESHTOKEN_KEY = 'refresh-token';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  userChange = new BehaviorSubject<any>(null);
  constructor(private router: Router) {}

  signOut(): void {
    this.userChange.next(null);
    localStorage.clear();
    this.router.navigate(['/']);
  }

  public saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.router.navigate(['/']);
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
