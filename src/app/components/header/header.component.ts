import { TokenStorageService } from './../../services/token-storage.service';
import { UserInforService } from './../../services/user-infor.service';
import { AuthService } from './../../services/auth.service';
import { DropdownDirective } from './../../directives/dropdown.directive';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/model/user.model';
import { Subscription, switchMap } from 'rxjs';
import {
  SocialAuthService,
  SocialLoginModule,
  SocialUser,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    MegaMenuModule,
    RouterModule,
    DropdownDirective,
    SocialLoginModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isSiteLogin = true;
  isShowSearchDropdownMobile = false;
  isShowAccountDropdown = false;
  isShowCategoryDropdown = false;
  isLoading = false;

  userSubject!: Subscription;
  user!: User;
  loginForm!: FormGroup;
  tokenExpirationTimer: any;
  eventBusSub?: Subscription;
  socialUser!: SocialUser;
  constructor(
    private el: ElementRef,
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.listenerSocialAuth();
    this.initForm();
    this.autoLogin();
    this.userSubject = this.tokenStorageService.userChange.subscribe((user) => {
      this.user = user;
    });
  }

  /**
   * Listener event authen with social: Google:
   * - Login with google.
   */
  listenerSocialAuth() {
    this.socialAuthService.authState
      .pipe(
        switchMap((response: any) => {
          return this.authService.loginWithGoogle({ value: response.idToken });
        })
      )
      .subscribe({
        next: (response) => {
          this.addUserInformationToLocalstorage(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: [null, Validators.required],
      password: null,
    });
  }

  /**
   * Auto login if has user information from localstorage.
   */
  autoLogin() {
    if (this.userInforService.user) {
      this.tokenStorageService.userChange.next(this.userInforService.user);
    }
  }

  getUser() {
    this.authService.getuser().subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  /**
   * Handle when click login.
   */
  onLogin() {
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginForm.reset();
        this.addUserInformationToLocalstorage(response);
      },
      error: (err) => {
        alert(err.error.data);
        this.isLoading = false;
      },
    });
  }
  /**
   * @param response {token,refreshToken,userInfo}
   */
  addUserInformationToLocalstorage(response: any) {
    this.userInforService.user = {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      roles: response.data.roles,
    };
    this.tokenStorageService.saveToken(response.data.token);
    this.tokenStorageService.saveRefreshToken(response.data.refreshToken);
    this.tokenStorageService.userChange.next(this.userInforService.user);
  }

  logout() {
    this.tokenStorageService.userChange.next(null);
    this.tokenStorageService.signOut();
  }

  ngOnDestroy(): void {
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }
  }

  /**
   * Switch site account login <-> forgot account
   */
  changeSiteAccount() {
    let siteLogin = this.el.nativeElement.querySelector('#site-login');
    let siteForgot = this.el.nativeElement.querySelector('#site-forgot');

    let accountDropdownList = this.el.nativeElement.querySelector(
      '.account-dropdown-list'
    );
    console.log(accountDropdownList.style);
    if (siteLogin.classList.contains('is-selected')) {
      siteLogin.classList.remove('is-selected');
      siteForgot.classList.add('is-selected');
      accountDropdownList.classList.add('height-forgot');
      accountDropdownList.classList.remove('height-login');
    } else {
      siteForgot.classList.remove('is-selected');
      siteLogin.classList.add('is-selected');
      accountDropdownList.classList.add('height-login');
      accountDropdownList.classList.remove('height-forgot');
    }
    this.isSiteLogin = !this.isSiteLogin;
  }
  changeShowSearchDropdownMobile() {
    this.isShowSearchDropdownMobile = !this.isShowSearchDropdownMobile;
  }
  changeShowAccountDropdown() {
    this.isShowAccountDropdown = !this.isShowAccountDropdown;
  }
  changeShowCategoryDropdown() {
    this.isShowCategoryDropdown = !this.isShowCategoryDropdown;
  }
}
