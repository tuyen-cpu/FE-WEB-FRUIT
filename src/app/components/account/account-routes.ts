import { AuthGuard } from './../../guards/auth.guard';
import { OrderComponent } from './order/order.component';
import { Routes } from '@angular/router';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AddressComponent } from './address/address.component';
import { AccountComponent } from './account.component';
import { ProfileComponent } from './profile/profile.component';
export const AccountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
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
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: ProfileComponent,
      },
    ],
  },
];
