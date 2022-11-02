import { UserInforService } from './user-infor.service';
import { TokenStorageService } from './token-storage.service';
import {
  Observable,
  BehaviorSubject,
  catchError,
  switchMap,
  throwError,
  filter,
  take,
  tap,
} from 'rxjs';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
const TOKEN_HEADER_KEY = 'Authorization';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  constructor(
    private tokenService: TokenStorageService,
    private authService: AuthService,
    private userInforServicel: UserInforService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<Object>> {
    const token = this.tokenService.getToken();
    if (token) {
      req = this.addTokenHeader(req, token);
    }
    return next.handle(req).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/signin') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }

        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this.tokenService.getRefreshToken();

      if (token) {
        return this.authService.refreshToken(token).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            this.tokenService.saveToken(response.data.accessToken);
            this.tokenService.saveRefreshToken(response.data.refreshToken);
            this.refreshTokenSubject.next(response.data.accessToken);

            return next.handle(
              this.addTokenHeader(request, response.data.accessToken)
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.tokenService.signOut();
            this.tokenService.userChange.next(this.userInforServicel.user);

            alert('Đã hết phiên đăng nhập!');
            return throwError(err);
          })
        );
      }
    }

    this.isRefreshing = false;
    alert('vui lòng đăng nhập');
    return next.handle(request);
  }
  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token),
    });
  }
}
