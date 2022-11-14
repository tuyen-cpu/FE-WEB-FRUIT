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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingComponent } from 'src/app/utils/loading/loading.component';
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
    ProgressSpinnerModule,
    LoadingComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductListComponent implements OnInit {
  isShowFilterCategory = true;
  isShowFilterPrice = true;

  paginator: Paginator = { totalElements: 0 };

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
        paginator.pageNumber!,
        paginator.pageSize!
      )
      .subscribe({
        next: (response) => {
          setTimeout(() => {
            this.products = response.data.content;
            this.paginator.totalElements = response.data.totalPages;
            this.isLoading = false;
          }, 500);
        },
        error: (response) => {
          console.log(response);
          this.isLoading = false;
        },
      });
  }
  changeRouter() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.filter.categoryId = Number(paramMap.get('categoryId'));
      this.getProducts(this.filter, this.paginator);
    });
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 12;
      this.filter.price = Number(res['price']) || 99999999;
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
    this.addParams();
  }
  onPageChange(event: any) {
    this.paginator.pageNumber = event.page;
    this.paramsURL = {
      ...this.paramsURL,
      page: this.paginator.pageNumber! + 1,
      size: this.paginator.pageSize,
    };
    // this.getProducts(this.filter, this.paginator);
    this.addParams();
  }
  addParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsURL,
    });
  }
  changeSort() {}
  trackById(index: number, item: any) {
    return item.id;
  }
}
