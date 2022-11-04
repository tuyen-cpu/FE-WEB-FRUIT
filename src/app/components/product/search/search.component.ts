import { switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductItemComponent } from '../product-item/product-item.component';
import { Product } from 'src/app/model/category.model';
import ProductService from 'src/app/services/product.service';
import { PaginatorModule } from 'primeng/paginator';
import { Paginator } from 'src/app/model/paginator.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ProductItemComponent, PaginatorModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  products: Product[] = [];
  paginator: Paginator = { pageNumber: 0, pageSize: 12, totalElements: 0 };
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap((res: any) => {
          return this.productService.search(res['query']);
        })
      )
      .subscribe({
        next: (response) => {
          this.paginator.totalElements = response.data.totalPages;
          this.products = response.data.content;
        },
        error: (response) => {},
      });
  }
  onPageChange(event: any) {
    console.log(event);
    this.paginator.pageNumber = event.page;
    //  this.getProducts(this.filter, this.paginator);
  }
}
