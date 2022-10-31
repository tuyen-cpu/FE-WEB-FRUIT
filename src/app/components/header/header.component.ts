import { UserInforService } from './../../services/user-infor.service';
import { UserService } from './../../services/auth.service';
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
  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private fb: FormBuilder,
    private userService: UserService,
    private userInforService: UserInforService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, Validators.required],
      password: null,
    });
    this.autoLogin();

    this.userSubject = this.userService.userChange.subscribe((user) => {
      this.user = user;
    });
  }
  autoLogin() {
    if (this.userInforService.user) {
      this.userService.userChange.next(this.userInforService.user);
    }
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
    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginForm.reset();
        this.userInforService.user = response.data;
        this.userService.userChange.next(this.userInforService.user);
      },
      error: (err) => {
        alert(err.error.data);
        this.isLoading = false;
      },
    });
  }
  logout() {
    this.userService.logout().subscribe({
      next: (data) => {
        console.log(data);
        this.userService.userChange.next(null);
        this.userInforService.delete();
      },
    });
  }
  refreshToekn() {
    this.userService.refreshToken().subscribe({
      next: (da) => {
        console.log(da);
      },
    });
  }
  ngOnDestroy(): void {
    this.userSubject.unsubscribe();
  }
}
