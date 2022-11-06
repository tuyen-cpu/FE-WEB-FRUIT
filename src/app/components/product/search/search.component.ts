import { switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
  paginator: Paginator = { pageNumber: 0, pageSize: 5, totalElements: 0 };
  key: string = '';
  paramsURL: {} = {};
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap((res: any) => {
          console.log('change params', res['query']);
          this.key = res['query'];
          if (res['page'] === undefined) {
            this.paginator.pageNumber = 0;
          } else {
            this.paginator.pageNumber = res['page'] - 1;
          }
          this.paginator.pageSize = Number(res['size']) || 5;
          this.paramsURL = { ...this.paramsURL, query: this.key };
          return this.productService.search(
            this.key,
            this.paginator.pageNumber!,
            this.paginator.pageSize!
          );
        })
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.paginator.totalElements = response.data.totalPages;
          this.products = response.data.content;
        },
        error: (response) => {
          console.log(response);
        },
      });
  }

  onPageChange(event: any) {
    console.log(event);
    this.paginator.pageNumber = event.page;
    this.paramsURL = {
      ...this.paramsURL,
      page: this.paginator.pageNumber! + 1,
      size: this.paginator.pageSize,
    };
    this.addParams();
  }
  addParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsURL,
    });
  }
}
