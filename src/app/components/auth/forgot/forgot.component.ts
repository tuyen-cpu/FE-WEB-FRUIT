import { ShareMessageService } from 'src/app/services/share-message.service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { UserInforService } from '../../../services/user-infor.service';
import { AuthService } from '../../../services/auth.service';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Validation } from 'src/app/utils/Validation';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit {
  forgotForm!: FormGroup;
  submitted = false;

  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private messageService: MessageService,
    private shareMessageService: ShareMessageService,
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }
  onSubmit() {
    this.isLoading = true;
    console.log(this.forgotForm.value);
    this.authService.forgot(this.forgotForm.value.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate['/'];
        this.shareMessageService.message.next(response.data);
      },
      error: (e) => {
        this.isLoading = false;
        this.showErrorMessage('Error', e.error.message);
      },
    });
  }

  get getEmail() {
    return this.forgotForm.controls['email'];
  }

  get f(): { [key: string]: AbstractControl } {
    return this.forgotForm.controls;
  }
  showSuccessMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }
  showErrorMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }
}
