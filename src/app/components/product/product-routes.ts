import { SearchComponent } from './search/search.component';
import { ProductListComponent } from './product-list/product-list.component';

import { ProductComponent } from './product.component';
import { Routes } from '@angular/router';
export const ProductRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list/:categoryId',
        component: ProductListComponent,
      },
      {
        path: 'list',
        component: ProductListComponent,
      },
      {
        path: 'search',
        component: SearchComponent,
      },
    ],
  },
];
