import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SearchComponent } from './search/search.component';
import { ProductListComponent } from './product-list/product-list.component';
import { Routes } from '@angular/router';
export const ProductRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list/all', pathMatch: 'full' },
      {
        path: 'list/:categorySlug',
        component: ProductListComponent,
      },
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
