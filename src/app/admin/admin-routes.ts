import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'user',
        component: UserComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'product',
        component: ProductComponent,
      },
    ],
  },
];
