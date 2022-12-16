import { UserService } from './../services/user.service';
import { UserInforService } from './../services/user-infor.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(public userInforService: UserInforService, public router: Router, private userService: UserService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // debugger;
    if (!this.userInforService.user?.id) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    } else {
      if (this.userInforService.user.roles.includes('admin') || this.userInforService.user.roles.includes('manager')) {
        return true;
      }
      this.router.navigate(['/']);
      return false;
    }
  }
}
