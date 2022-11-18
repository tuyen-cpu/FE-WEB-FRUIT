import { AuthGuard } from './../../guards/auth.guard';
import { OrderComponent } from './order/order.component';
import { ForgotComponent } from './forgot/forgot.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './register/verify/verify.component';
import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AddressComponent } from './address/address.component';
import { AccountComponent } from './account.component';
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
      {
        path: 'order',
        canActivate: [AuthGuard],
        component: OrderComponent,
      },
      {
        path: 'order/:orderId',
        canActivate: [AuthGuard],
        component: OrderDetailComponent,
      },
      {
        path: 'address',
        canActivate: [AuthGuard],
        component: AddressComponent,
      },
    ],
  },
];
