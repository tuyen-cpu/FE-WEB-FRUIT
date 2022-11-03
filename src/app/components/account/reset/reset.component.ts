import { TokenStorageService } from '../../../services/token-storage.service';
import { UserInforService } from '../../../services/user-infor.service';
import { AuthService } from '../../../services/auth.service';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Validation } from 'src/app/utils/Validation';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
  ],
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit {
  resetForm!: FormGroup;
  submitted = false;

  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.resetForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [Validation.match('password', 'confirmPassword')],
      }
    );
  }
  onSubmit() {
    this.isLoading = true;
    this.authService
      .reset({
        verifyCode: this.route.snapshot.queryParams['code'],
        password: this.resetForm.value.password,
      })
      .subscribe({
        next: (response) => {
          alert(response.data);
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (response) => {
          this.isLoading = false;
          console.log(response);
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

  get getPassword() {
    return this.resetForm.controls['password'];
  }
  get getConfirmPassword() {
    return this.resetForm.controls['confirmPassword'];
  }

  get f(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }
}
