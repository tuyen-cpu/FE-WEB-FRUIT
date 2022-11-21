import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TokenStorageService } from './../../../services/token-storage.service';
import { UserInforService } from './../../../services/user-infor.service';
import { AuthService } from './../../../services/auth.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { User } from 'src/app/model/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  submitted = false;
  returnUrl!: string;
  isLoading = false;
  userSupscription!: Subscription;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
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

    this.profileForm = this.fb.group({
      email: [
        this.userInforService.user?.email,
        [Validators.email, Validators.required],
      ],
      firstName: [
        this.userInforService.user?.firstName,
        [Validators.email, Validators.required, Validators.minLength(3)],
      ],
      lastName: [
        this.userInforService.user?.lastName,
        [Validators.email, Validators.required, Validators.minLength(3)],
      ],
    });
    this.profileForm.controls['email'].disable();
  }
  onSubmit() {
    this.isLoading = true;
    console.log(this.profileForm.value);
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
  ngOnDestroy(): void {
    if (this.userSupscription) {
      this.userSupscription.unsubscribe();
    }
  }
}
