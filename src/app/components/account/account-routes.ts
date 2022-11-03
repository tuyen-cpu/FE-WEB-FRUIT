import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './register/verify/verify.component';
import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
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
      {
        path: 'reset',
        component: ResetComponent,
      },
      {
        path: 'forgot',
        component: ForgotComponent,
      },
    ],
  },
];
