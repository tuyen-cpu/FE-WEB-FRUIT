import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
//component

import { FileUploadService } from './../../services/file-upload.service';
import { CategoryService } from './../../services/category.service';
import { CartItemService } from './../../services/cart-item.service';
import { CartItem } from './../../model/cart.model';
import { TokenStorageService } from './../../services/token-storage.service';
import { UserInforService } from './../../services/user-infor.service';
import { AuthService } from './../../services/auth.service';
import { DropdownDirective } from './../../directives/dropdown.directive';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import ProductService from 'src/app/services/product.service';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';

//model
import { User } from 'src/app/model/user.model';
import { Category, Product } from 'src/app/model/category.model';

//primeng
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';

//ngx-translator
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    MegaMenuModule,
    RouterModule,
    DropdownDirective,
    SocialLoginModule,
    HighlighterPipe,
    ToastModule,
    InputTextModule,
    MyCurrency,
    TranslateModule,
    DropdownModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchInputMobile') searchInputMobile!: ElementRef;

  isSiteLogin = true;
  isShowSearchDropdownMobile = false;
  isShowAccountDropdown = false;
  isShowCategoryDropdown = false;
  isLoading = false;

  userSubject!: Subscription;
  user!: User;
  loginForm!: FormGroup;
  tokenExpirationTimer: any;
  loginSubscription?: Subscription;
  socialUser!: SocialUser;
  keySearch = '';
  products: Product[] = [];
  searchForm!: FormGroup;
  private subjectKeyup = new Subject<any>();
  private cartItemsSubscription!: Subscription;
  carts: CartItem[] = [];
  categories: Category[] = [];
  totalQuantity: number = 0;
  totalCart: number = 0;
  urlImage!: string;
  loginFormSubscription: Subscription;
  isDisable = true;
  googleSubscription: Subscription;
  isShowPassword = false;
  languages = [
    { name: 'vn', code: 'VN' },
    { name: 'en', code: 'US' },
  ];
  language: { name: string; code: string };
  constructor(
    private el: ElementRef,
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private socialAuthService: SocialAuthService,
    private productService: ProductService,
    private router: Router,
    private cartItemService: CartItemService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private fileUploadService: FileUploadService,
    public translateService: TranslateService,
  ) {
    // translateService.addLangs(['en', 'vn']);
    // translateService.setDefaultLang('en');
  }
  translateSite(langauge: string) {
    this.translateService.use(langauge);
  }
  ngOnInit(): void {
    this.language = { name: 'en', code: 'US' };
    this.urlImage = this.fileUploadService.getLink();
    this.listenerSocialAuth();
    this.initForm();
    this.autoLogin();
    this.getCategory();
    this.userSubject = this.tokenStorageService.userChange.pipe(distinctUntilChanged()).subscribe({
      next: (data) => {
        this.user = data;

        if (data) {
          this.getCartItems(data.id);
        } else {
          this.cartItemService.next([]);
        }
      },
    });
    this.searchProduct();
    this.cartItemsSubscription = this.cartItemService.cartItemsChange.subscribe({
      next: (response) => {
        this.carts = response;
        this.loadTotal();
      },
      error: (response) => {},
    });
    this.loginFormSubscription = this.loginForm.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (res) => {
        this.isDisable = false;
      },
      error: (res) => {},
    });
  }
  getCartItems(userId: number) {
    this.cartItemService.getAllByUserId(userId).subscribe({
      next: (res) => {
        this.cartItemService.next(res.data.content);
      },
    });
  }
  getCategory() {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        console.log("tại header")
        this.categories = res.data.content;
      },
      error: (res) => {},
    });
  }
  loadTotal() {
    this.totalQuantity = this.carts.reduce((total, current) => {
      return total + current.quantity;
    }, 0);
    this.totalCart = this.carts.reduce((total, current) => {
      return total + this.calcPriceDiscount(current.product.price, current.product.discount) * current.quantity;
    }, 0);
  }
  updateQuantity(element: any, cartItem: CartItem, action: string) {
    console.log('header');
    switch (action) {
      case '-':
        element.value--;
        break;
      case '+':
        element.value++;
        break;
      default:
        // if (!Number(element.value) || Number(element.value) < 0) {
        //   element.value = Number(1);
        // }

        break;
    }
    cartItem.quantity = Number(element.value);
    if (cartItem.quantity === 0) {
      this.remove(cartItem);
      return;
    }
    this.cartItemService.update(cartItem.id || 1000, cartItem.quantity, cartItem.product.id || 1000, this.user.id).subscribe({
      next: (res) => {
        this.showSuccessMessage('Success', res.message);
      },
      error: (res) => {
        this.showErrorMessage('Failed', res.error.message);
        element.value--;
        cartItem.quantity = Number(element.value);
        console.log(cartItem.quantity);
      },
    });
  }
  remove(cartItem: CartItem) {
    this.cartItemService.delete(cartItem.id || 1000).subscribe({
      next: (res) => {
        console.log(res.data);
      },
    });
  }

  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  searchProduct() {
    this.subjectKeyup.pipe(debounceTime(900), distinctUntilChanged()).subscribe((key) => {
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
  onSubmit(e: any) {
    if (!this.searchForm.valid || e.value === '') return;

    this.router.navigate(['/product/search'], {
      queryParams: { query: this.keySearch },
    });

    e.value = '';
    this.products = [];
    this.keySearch = '';

    this.products = [];
    this.isLoading = false;
    this.isShowSearchDropdownMobile = false;
    this.searchInput.nativeElement.classList.remove('open');
    this.searchInputMobile.nativeElement.classList.remove('open');
  }
  goSearchPage(event: any) {
    this.removeOpen(event);
    this.router.navigate(['/product/search'], {
      queryParams: { query: this.keySearch },
    });
  }
  onChangeShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }
  removeOpen(event: any) {
    event.value = '';
    this.searchInput.nativeElement.classList.remove('open');
    this.searchInputMobile.nativeElement.classList.remove('open');
  }
  instantSearch(event: any) {
    const value = event.target.value;
    if (this.hasBlankSpaces(value)) {
      this.products = [];
      this.isLoading = false;
      this.isShowSearchDropdownMobile = false;
      this.searchInput.nativeElement.classList.remove('open');
      this.searchInputMobile.nativeElement.classList.remove('open');

      return;
    }
    this.searchInput.nativeElement.classList.add('open');
    this.searchInputMobile.nativeElement.classList.add('open');
    this.isShowSearchDropdownMobile = true;
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
    this.googleSubscription = this.socialAuthService.authState
      .pipe(
        switchMap((response: any) => {
          return this.authService.loginWithGoogle({ value: response.idToken });
        }),
      )
      .subscribe({
        next: (response) => {
          this.addUserInformationToLocalstorage(response);
          if (response.data.roles.includes('admin') || response.data.roles.includes('manager')) {
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
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
    this.isDisable = true;
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginForm.reset();
        this.addUserInformationToLocalstorage(response);
        this.changeShowAccountDropdown();
        if (response.data.roles.includes('admin') || response.data.roles.includes('manager')) {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
          life: 3000,
        });
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
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      roles: response.data.roles,
    };
    console.log(response);
    this.tokenStorageService.saveToken(response.data.token);
    this.tokenStorageService.saveRefreshToken(response.data.refreshToken);
    this.tokenStorageService.userChange.next(this.userInforService.user);
  }

  logout() {
    this.tokenStorageService.signOut();
  }

  ngOnDestroy(): void {
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }
    if (this.googleSubscription) {
      this.googleSubscription.unsubscribe();
    }
    if (this.subjectKeyup) {
      this.subjectKeyup.unsubscribe();
    }
    if (this.cartItemsSubscription) {
      this.cartItemsSubscription.unsubscribe();
    }
  }

  /**
   * Switch site account login <-> forgot account
   */
  changeSiteAccount() {
    let siteLogin = this.el.nativeElement.querySelector('#site-login');
    let siteForgot = this.el.nativeElement.querySelector('#site-forgot');

    let accountDropdownList = this.el.nativeElement.querySelector('.account-dropdown-list');
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
  changeShowSearchDropdownMobile(e: any) {
    this.isShowSearchDropdownMobile = !this.isShowSearchDropdownMobile;
    e.value = '';
    this.keySearch = '';
  }
  changeShowAccountDropdown() {
    this.isShowAccountDropdown = !this.isShowAccountDropdown;
  }
  changeShowCategoryDropdown() {
    this.isShowCategoryDropdown = !this.isShowCategoryDropdown;
  }
  showSuccessMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 1000,
    });
  }
  showErrorMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
    });
  }
  trackById(index: number, item: any) {
    return item.id;
  }
  get getLoginForm(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  get getEmail() {
    return this.loginForm.controls['email'];
  }
  get getPassword() {
    return this.loginForm.controls['password'];
  }
}
