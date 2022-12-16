import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TokenStorageService } from './../../../services/token-storage.service';
import { UserInforService } from './../../../services/user-infor.service';
import { AuthService } from './../../../services/auth.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { User } from 'src/app/model/user.model';
import { nameValidator, Validation } from 'src/app/utils/Validation';
import { name } from 'src/app/utils/regex';
import { UserService } from 'src/app/services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  resetForm!: FormGroup;
  submitted = false;
  returnUrl!: string;
  isLoading = false;
  isDisable = true;
  isLoadingChangePassword = false;
  userSubscription!: Subscription;
  valueFormSubscription!: Subscription;
  resetFormSubscription!: Subscription;
  errorMessageInvalidPassword!: string;
  isShowRePassword = false;
  isShowPassword = false;
  isShowNewPassword = false;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    // this.userSupscription = this.tokenStorageService.userChange.subscribe(
    //   (data: User) => {
    //     this.profileForm.setValue({
    //       email: data.email,
    //       firstName: data.firstName,
    //       lastName: data.lastName,
    //     });
    //   }
    // );

    this.initForm();
    this.profileForm.controls['email'].disable();
    this.valueFormSubscription = this.profileForm.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (res) => {
        this.isDisable = false;
      },
      error: (res) => {
        this.isLoading = false;
      },
    });
    this.resetFormSubscription = this.resetForm.valueChanges.pipe(distinctUntilChanged()).subscribe({
      next: (res) => {
        this.errorMessageInvalidPassword = '';
      },
      error: (res) => {},
    });
  }
  onChangeShowRePassword() {
    this.isShowRePassword = !this.isShowRePassword;
  }
  onChangeShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }
  onChangeShowNewPassword() {
    this.isShowNewPassword = !this.isShowNewPassword;
  }

  onSubmit() {
    this.isLoading = true;
    console.log(this.profileForm.value);

    let formValue = this.profileForm.value;
    this.userService
      .update({
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        id: this.userInforService.user?.id,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.tokenStorageService.userChange.next(res.data);
          this.userInforService.user = {
            id: this.userInforService.user?.id,
            username: this.userInforService.user?.username,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: this.userInforService.user?.email,
            roles: this.userInforService.user?.roles,
          };
          this.isLoading = false;
          this.isDisable = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Your information has been edited!',
            life: 2000,
          });
        },
        error: (res) => {
          console.log(res);
          this.isLoading = false;
          this.isDisable = true;
        },
      });
  }
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
  get getEmail() {
    return this.profileForm.controls['email'];
  }
  get firstName() {
    return this.profileForm.controls['firstName'];
  }
  get lastName() {
    return this.profileForm.controls['lastName'];
  }
  get f(): { [key: string]: AbstractControl } {
    return this.profileForm.controls;
  }

  get getNewPassword() {
    return this.resetForm.controls['newPassword'];
  }
  get getOldPassword() {
    return this.resetForm.controls['oldPassword'];
  }
  get getConfirmPassword() {
    return this.resetForm.controls['confirmPassword'];
  }

  get getResetForm(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.valueFormSubscription) {
      this.valueFormSubscription.unsubscribe();
    }
  }
  initForm() {
    this.profileForm = this.fb.group({
      email: [this.userInforService.user?.email, [Validators.email, Validators.required]],
      firstName: [this.userInforService.user?.firstName, [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      lastName: [this.userInforService.user?.lastName, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    });
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
        oldPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [Validation.match('newPassword', 'confirmPassword')],
      },
    );
  }

  changePassword() {
    this.errorMessageInvalidPassword = '';
    this.isLoadingChangePassword = true;
    this.userService
      .changePassword({
        email: this.userInforService.user?.email!,
        password: this.resetForm.value.oldPassword,
        newPassword: this.resetForm.value.newPassword,
      })
      .subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: res.message,
            life: 2000,
          });
          this.isLoadingChangePassword = false;
          this.resetForm.reset();
        },
        error: (res) => {
          this.errorMessageInvalidPassword = res.error.message;
          this.isLoadingChangePassword = false;
        },
      });
  }
}
