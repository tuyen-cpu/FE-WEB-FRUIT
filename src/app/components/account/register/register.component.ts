import { AuthService } from './../../../services/auth.service';

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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;

  isLoading = false;
  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.email, Validators.required]],
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
    console.log(this.registerForm.value);
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('thanh cong', response);
        alert(
          'Đăng ký thành công, vui lòng kiểm tra mail để xác minh tài khoản'
        );
        this.isLoading = false;
      },
      error: (e) => {
        alert(e.error.data);
        this.isLoading = false;
      },
    });
  }

  get getLastName() {
    return this.registerForm.controls['lastName'];
  }
  get getFirstName() {
    return this.registerForm.controls['firstName'];
  }
  get getEmail() {
    return this.registerForm.controls['email'];
  }
  get getPassword() {
    return this.registerForm.controls['password'];
  }
  get getConfirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }
}
