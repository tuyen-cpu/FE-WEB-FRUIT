import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './register/verify/verify.component';
import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
export const AccountRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'register', pathMatch: 'full' },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'verify',
        component: VerifyComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
    ],
  },
];
