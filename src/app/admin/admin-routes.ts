import { CategoryManagerComponent } from './category-manager/category-manager.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { OrderComponent } from './order/order.component';
import { AdminGuard } from '../guards/admin.guard';
import { NotFoundComponent } from '../components/not-found/not-found.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'user',
        title: 'User',
        data: { title: 'User Manager' },

        component: UserComponent,
      },
      {
        path: 'home',
        title: 'Home',
        data: { title: 'Dashboard' },
        component: HomeComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'product',
        title: 'Product Manager',
        data: { title: 'Product Manager' },
        component: ProductComponent,
      },
      {
        path: 'order',
        title: 'Order Manager',
        data: { title: 'Order Manager' },
        component: OrderComponent,
      },
      {
        path: 'category',
        title: 'Category Manager',
        data: { title: 'Category Manager' },
        component: CategoryManagerComponent,
      },
    ],
  },
];
