import { ProductListComponent } from './product-list/product-list.component';

import { ProductComponent } from './product.component';
import { Routes } from '@angular/router';
export const ProductRoutes: Routes = [
    {
        path: '',
        component: ProductComponent,
        children: [
            {
                path: '',
                component: ProductListComponent,
            },
            
        ],
    },
];
