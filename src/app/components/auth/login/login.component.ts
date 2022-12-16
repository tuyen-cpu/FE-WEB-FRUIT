import { Subscription } from 'rxjs';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { TokenStorageService } from '../../../services/token-storage.service';
import { UserInforService } from '../../../services/user-infor.service';
import { AuthService } from '../../../services/auth.service';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Validation } from 'src/app/utils/Validation';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  submitted = false;
  returnUrl!: string;
  isLoading = false;
  userSupscription!: Subscription;
  isShowPassword = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.userSupscription = this.tokenStorageService.userChange.subscribe((data) => {
      if (data) {
        this.router.navigate(['/']);
      }
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
    });
  }
  onChangeShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }
  onSubmit() {
    this.isLoading = true;
    console.log(this.loginForm.value);
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.addUserInformationToLocalstorage(response);
        // this.router.navigate(['/']);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (e) => {
        this.showErrorMessage('Error', e.error.message);
        this.isLoading = false;
      },
    });
  }
  addUserInformationToLocalstorage(response: any) {
    this.userInforService.user = {
      id: response.data.id,
      username: response.data.username,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      roles: response.data.roles,
    };
    this.tokenStorageService.saveToken(response.data.token);
    this.tokenStorageService.saveRefreshToken(response.data.refreshToken);
    this.tokenStorageService.userChange.next(this.userInforService.user);
  }
  get getEmail() {
    return this.loginForm.controls['email'];
  }
  get getPassword() {
    return this.loginForm.controls['password'];
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  ngOnDestroy(): void {
    if (this.userSupscription) {
      this.userSupscription.unsubscribe();
    }
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
      life: 1000,
    });
  }
}
