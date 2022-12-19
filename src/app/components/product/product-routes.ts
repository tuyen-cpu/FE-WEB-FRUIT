import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SearchComponent } from './search/search.component';
import { ProductListComponent } from './product-list/product-list.component';

import { ProductComponent } from './product.component';
import { Routes } from '@angular/router';
import { ProductItemComponent } from './product-item/product-item.component';
export const ProductRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      {
        path: 'list/:categorySlug',
        component: ProductListComponent,
      },
      {
        path: 'all',
        component: ProductListComponent,
      },
      { path: 'vv', component: ProductItemComponent },
      {
        path: 'search',
        component: SearchComponent,
      },
      {
        path: ':slug',
        component: ProductDetailComponent,
      },
    ],
  },
];
