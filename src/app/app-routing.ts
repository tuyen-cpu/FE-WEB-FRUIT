import { AccountRoutes } from './components/account/account-routes';
import { HomeComponent } from './components/home/home.component';

import { Routes } from '@angular/router';

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
  },
];
