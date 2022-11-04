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
  ViewChild,
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import { ProgressBarModule } from 'primeng/progressbar';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/model/user.model';
import { debounceTime, Subject, Subscription, switchMap } from 'rxjs';
import {
  SocialAuthService,
  SocialLoginModule,
  SocialUser,
} from '@abacritt/angularx-social-login';
import ProductService from 'src/app/services/product.service';
import { Product } from 'src/app/model/category.model';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ProgressBarModule,
    MegaMenuModule,
    RouterModule,
    DropdownDirective,
    SocialLoginModule,
    HighlighterPipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
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
  keySearch = '';
  products: Product[] = [];
  searchForm!: FormGroup;
  private subjectKeyup = new Subject<any>();
  constructor(
    private el: ElementRef,
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private socialAuthService: SocialAuthService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.listenerSocialAuth();
    this.initForm();
    this.autoLogin();
    this.userSubject = this.tokenStorageService.userChange.subscribe((user) => {
      this.user = user;
    });
    this.searchProduct();
  }
  searchProduct() {
    this.subjectKeyup.pipe(debounceTime(900)).subscribe((key) => {
      this.isLoading = false;
      this.productService.search(key, 0, 6).subscribe({
        next: (response) => {
          this.products = response.data.content;
          console.log(response.data);
        },
        error: (response) => {
          console.log(response);
        },
      });
    });
  }
  onSubmit() {
    if (!this.searchForm.valid) return;
    this.goSearchPage();
    this.products = [];
  }
  goSearchPage() {
    this.router.navigate(['/product/search'], {
      queryParams: { query: this.keySearch },
    });
  }
  instantSearch(event: any) {
    const value = event.target.value;
    if (this.hasBlankSpaces(value)) {
      this.products = [];
      this.isLoading = false;
      this.searchInput.nativeElement.classList.remove('open');
      return;
    }
    this.searchInput.nativeElement.classList.add('open');
    this.isLoading = true;
    this.keySearch = value;
    this.subjectKeyup.next(value);
  }
  /*
  Validate variable
  if value of variable is null,
  empty and has blank spaces
  */
  hasBlankSpaces(str: string) {
    return str === null || str.match(/^ *$/) !== null;
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
    this.searchForm = this.fb.group({
      inputSearch: ['', Validators.required],
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
    if (this.subjectKeyup) {
      this.subjectKeyup.unsubscribe();
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
