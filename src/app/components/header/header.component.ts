import { EventBusService } from './../../services/event-bus.service';
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
import { MegaMenuItem } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/model/user.model';
import { Subscription } from 'rxjs';

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

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private eventBusService: EventBusService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, Validators.required],
      password: null,
    });
    this.autoLogin();

    this.userSubject = this.tokenStorageService.userChange.subscribe((user) => {
      this.user = user;
    });
    // this.eventBusSub = this.eventBusService.on('logout', () => {
    //   this.logout();
    // });
  }
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
  onSubmit() {
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log(response);
        this.isLoading = false;
        // this.loginForm.reset();
        this.userInforService.user = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          roles: response.data.roles,
        };
        this.tokenStorageService.saveToken(response.data.token);
        this.tokenStorageService.saveRefreshToken(response.data.refreshToken);
        this.tokenStorageService.userChange.next(this.userInforService.user);
      },
      error: (err) => {
        alert(err.error.data);
        this.isLoading = false;
      },
    });
  }
  logout() {
    // this.authService.logout().subscribe({
    //   next: (data) => {
    //     console.log(data);
    //     this.authService.userChange.next(null);
    //     this.tokenStorageService.signOut();
    //   },
    // });
    this.tokenStorageService.userChange.next(null);
    this.tokenStorageService.signOut();
  }
  refreshToekn() {
    this.authService
      .refreshToken(this.tokenStorageService.getRefreshToken() || '')
      .subscribe({
        next: (da) => {
          console.log(da);
        },
      });
  }
  ngOnDestroy(): void {
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }

    // if (this.eventBusSub) {
    //   this.eventBusSub.unsubscribe();
    // }
  }
}
