import { Routes } from '@angular/router';
import { AccountComponent } from '../account/account.component';
import { AuthGuard } from './../../guards/auth.guard';
import { AuthComponent } from './auth.component';
import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './register/verify/verify.component';
import { ResetComponent } from './reset/reset.component';

export const AuthRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
