import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserInforService {
  USER = 'user';

  constructor() {}

  get user(): User | null {
    const user = localStorage.getItem(this.USER);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  set user(value: User | null) {
    localStorage.setItem(this.USER, JSON.stringify(value));
  }
  delete() {
    localStorage.removeItem(this.USER);
  }
}
