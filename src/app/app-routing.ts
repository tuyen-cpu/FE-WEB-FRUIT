import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { AccountRoutes } from './components/account/account-routes';
import { HomeComponent } from './components/home/home.component';

import { Routes } from '@angular/router';
import { ProvincesApiService } from './services/provinces-api.service';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'product',
    loadChildren: () =>
      import('./components/product/product-routes').then(
        ({ ProductRoutes }) => ProductRoutes
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import(`./components/cart/cart.component`).then((c) => c.CartComponent),
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./components/account/account-routes').then(
        ({ AccountRoutes }) => AccountRoutes
      ),
    providers: [SocialLoginModule, ProvincesApiService],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component').then(
        (c) => c.CheckoutComponent
      ),
    providers: [ProvincesApiService],
  },
];
