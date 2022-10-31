import { UserService } from '../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.email],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(40),
        ],
      ],
    });
  }
  onSubmit() {
    console.log(this.registerForm.value);
    this.userService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('thanh cong', response);
        alert(
          'Đăng ký thành công, vui lòng kiểm tra mail để xác minh tài khoản'
        );
      },
      error: (e) => {
        alert(e.error.data);
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
}
