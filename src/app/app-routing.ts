import { UserService } from 'src/app/services/user.service';
import { AuthGuard } from './guards/auth.guard';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { AccountRoutes } from './components/account/account-routes';
import { HomeComponent } from './components/home/home.component';

import { Routes } from '@angular/router';
import { ProvincesApiService } from './services/provinces-api.service';
import { MessageService } from 'primeng/api';
import OrderManagerService from './services/admin/order-manager.service';
import { AdminGuard } from './guards/admin.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'product',

    loadChildren: () => import('./components/product/product-routes').then(({ ProductRoutes }) => ProductRoutes),
  },
  {
    path: 'cart',
    loadComponent: () => import(`./components/cart/cart.component`).then((c) => c.CartComponent),
  },
  {
    path: 'account',

    loadChildren: () => import('./components/account/account-routes').then(({ AccountRoutes }) => AccountRoutes),
    providers: [SocialLoginModule, ProvincesApiService, AuthGuard, UserService],
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/checkout/checkout.component').then((c) => c.CheckoutComponent),
    providers: [ProvincesApiService, MessageService],
  },
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth-routes').then(({ AuthRoutes }) => AuthRoutes),
    providers: [UserService],
  },
  {
    path: 'admin',

    loadChildren: () => import('./admin/admin-routes').then(({ AdminRoutes }) => AdminRoutes),
    providers: [UserService, OrderManagerService, AdminGuard],
  },
  { path: '**', redirectTo: '404' },
  {
    path: '404',
    component: NotFoundComponent,
  },
];
