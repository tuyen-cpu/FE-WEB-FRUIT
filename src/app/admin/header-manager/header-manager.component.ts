import { distinctUntilChanged, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
//component
import { UserInforService } from './../../services/user-infor.service';
import { DropdownDirective } from '../../directives/dropdown.directive';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { User } from 'src/app/model/user.model';
import { Validation } from 'src/app/utils/Validation';

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-header-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AvatarModule,
    AvatarGroupModule,
    DropdownDirective,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './header-manager.component.html',
  styleUrls: ['./header-manager.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderManagerComponent implements OnInit, OnDestroy {
  @Output() newItemEvent = new EventEmitter<boolean>();
  isShowSidebar = true;
  displayChangePassword = false;
  isLoading = false;
  currentUser!: User;
  changePasswordForm: FormGroup;
  errorMessageInvalidPassword!: string;
  resetFormSubscription: Subscription;
  constructor(
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private authService: AuthService,
    private userInforService: UserInforService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private userManagerService: UserManagerService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userInforService.user;
    this.initFormChangePassword();
    this.resetFormSubscription = this.changePasswordForm.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (res) => {
        this.errorMessageInvalidPassword = '';
      },
      error: (res) => {},
    });
  }
  addClassToParent() {
    this.isShowSidebar = !this.isShowSidebar;
    this.newItemEvent.emit(this.isShowSidebar);
  }
  initFormChangePassword() {
    this.changePasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [Validation.match('newPassword', 'confirmPassword')],
      },
    );
  }
  changePassword() {
    this.isLoading = true;
    this.userManagerService
      .changePassword({
        email: this.userInforService.user.email,
        newPassword: this.changePasswordForm.value.newPassword,
        password: this.changePasswordForm.value.password,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.changePasswordForm.reset();
          this.errorMessageInvalidPassword = '';
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Added product successfully!',
            life: 2000,
          });
        },
        error: (res) => {
          this.isLoading = false;
          this.errorMessageInvalidPassword = res.error.message;
        },
      });
  }

  get getChangePasswordForm(): { [key: string]: AbstractControl } {
    return this.changePasswordForm.controls;
  }
  get getNewPassword() {
    return this.changePasswordForm.controls['newPassword'];
  }
  get getPassword() {
    return this.changePasswordForm.controls['password'];
  }
  get getConfirmPassword() {
    return this.changePasswordForm.controls['confirmPassword'];
  }

  public logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/']);
  }
  ngOnDestroy(): void {
    if (this.resetFormSubscription) {
      this.resetFormSubscription.unsubscribe();
    }
  }
}
