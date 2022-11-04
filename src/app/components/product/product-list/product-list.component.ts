import { debounceTime, map } from 'rxjs';
import {
  NavigationEnd,
  Router,
  RouterModule,
  ActivatedRoute,
  ParamMap,
} from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductItemComponent } from '../product-item/product-item.component';

import ProductService from 'src/app/services/product.service';
import { Category, Product } from 'src/app/model/category.model';
import { Paginator } from 'src/app/model/paginator.model';
import { CategoryService } from 'src/app/services/category.service';

//primeNg
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductItemComponent,
    AccordionModule,
    ButtonModule,
    RadioButtonModule,
    PaginatorModule,
    DropdownModule,
    ProgressBarModule,
    DialogModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductListComponent implements OnInit {
  isShowFilterCategory = true;
  isShowFilterPrice = true;

  paginator: Paginator = { pageNumber: 0, pageSize: 12, totalElements: 0 };

  priceList: number[] = [50000, 150000, 200000, 500000];
  sortOptionSelected = '';

  sortOptions: any[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  paramsURL: {} = {};

  filter: { categoryId: number; price: number } = {
    categoryId: 1,
    price: this.priceList[0],
  };
  isLoading: boolean = false;
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sortOptions = [
      { name: 'Giá tăng dần', code: 'PI' },
      { name: 'Giá giảm dần', code: 'PD' },
      { name: 'A-Z', code: 'AZ' },
      { name: 'Z-A', code: 'ZA' },
    ];
    this.changeRouter();
    this.changeParams();
    this.getCategory();
    // this.getProducts(this.filter, this.paginator);
  }
  getProducts(
    filter: { categoryId: number; price: number },
    paginator: Paginator
  ) {
    this.isLoading = true;
    this.productService
      .getProductByCategoryIdAndPriceLessThan(
        filter.categoryId,
        filter.price,
        paginator.pageNumber,
        paginator.pageSize
      )
      .subscribe({
        next: (response) => {
          console.log('Voà 1');
          this.products = response.data.content;
          this.paginator.totalElements = response.data.totalPages;
          console.log('vào 2');
          this.isLoading = false;
          console.log('Voà 3');
        },
        error: (response) => {
          console.log(response);
          this.isLoading = false;
        },
      });
  }
  changeRouter() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.paginator.pageNumber = 0;
      this.filter.categoryId = Number(paramMap.get('categoryId'));

      this.getProducts(this.filter, this.paginator);
    });
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      this.filter.price = res['price'] || 99999999;
      this.getProducts(this.filter, this.paginator);
    });
  }
  getCategory() {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (response) => {},
    });
  }
  toggleFilterCategory() {
    this.isShowFilterCategory = !this.isShowFilterCategory;
  }
  toggleFilterPrice() {
    this.isShowFilterPrice = !this.isShowFilterPrice;
  }
  changePrice() {
    this.paramsURL = { price: this.filter.price };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsURL,
    });
  }
  onPageChange(event: any) {
    console.log(event);
    this.paginator.pageNumber = event.page;
    this.getProducts(this.filter, this.paginator);
  }
  changeSort() {}
  trackById(index: number, item: any) {
    return item.id;
  }
}
