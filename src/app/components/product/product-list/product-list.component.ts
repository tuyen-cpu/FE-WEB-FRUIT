import {
  combineLatest,
  combineLatestAll, debounceTime,
  delay, distinctUntilChanged, filter, finalize,
  forkJoin,
  map,
  mergeWith, Subject,
  switchMap,
  take, tap,
  withLatestFrom,
} from 'rxjs';
import { Router, RouterModule, ActivatedRoute, ParamMap, Params, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

//component
import { MyCurrency } from './../../../pipes/my-currency.pipe';
import ProductService from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductItemComponent } from '../product-item/product-item.component';
import { Category, Product } from 'src/app/model/category.model';
import { Paginator } from 'src/app/model/paginator.model';
import { TranslateModule } from '@ngx-translate/core';

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
    MyCurrency,
    TranslateModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductListComponent implements OnInit {
  isShowFilterCategory = true;
  isShowFilterPrice = true;

  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };

  priceList: number[] = [50000, 150000, 200000, 500000];
  sortOptionSelected = '';

  sortOptions: any[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  paramsURL: {} = {};

  filterCondition: { categorySlug: string; price: number } = {
    categorySlug: 'trai-cay-nhapppp',
    price: this.priceList[0],
  };
  isLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sortOptions = [
      { name: 'Giá tăng dần', code: 'PI' },
      { name: 'Giá giảm dần', code: 'PD' },
      { name: 'A-Z', code: 'AZ' },
      { name: 'Z-A', code: 'ZA' },
    ];
    this.getCategory();
    this.changeRouter();
  }

  getProducts(filter: { categorySlug: string; price: number }, paginator: Paginator) {
    this.isLoading = true;
    this.productService
      .getProductByCategorySlugAndPriceLessThan(filter.categorySlug, filter.price, paginator.pageNumber!, paginator.pageSize!)
      .pipe(delay(500) ,finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (response) => {
          this.products = response.data.content;
          this.paginator.totalElements = response.data.totalElements;
        },
        error: (response) => {
          console.log(response);
          this.products = [];
        },
      });
  }
  changeRouter() {
    combineLatest({paramMap:this.route.paramMap,params:this.route.queryParams})
      .pipe(debounceTime(0))
      .subscribe(({paramMap, params}) => {
        console.log("change param")
      this.filterCondition.categorySlug = paramMap.get('categorySlug');
      if (params['page'] === undefined || +params['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = params['page'] - 1;
      }
      this.paginator.pageSize = Number(params['size']) || 12;
      this.filterCondition.price = Number(params['price']) || 99999999;
      this.getProducts(this.filterCondition, this.paginator);
    })
  }

  getCategory() {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response.data.content;
      },
      error: (response) => {},
    });
  }

  changePrice() {
    this.paramsURL = { price: this.filterCondition.price };
    this.addParams();
  }

  onPageChange(event: any) {
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
  trackById(index: number, item: any) {
    return item.id;
  }
}
