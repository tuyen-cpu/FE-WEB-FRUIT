import { RouterModule } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductItemComponent } from '../product-item/product-item.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
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
    CheckboxModule,
    PaginatorModule,
    DropdownModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductListComponent implements OnInit {
  isShowFilterCategory = true;
  isShowFilterPrice = false;
  selectedCities: string[] = [];
  priceList: number[] = [50, 100, 200, 500];
  sortOptionSelected = '';

  sortOptions: any[] = [];
  constructor() {}

  ngOnInit(): void {
    this.sortOptions = [
      { name: 'Giá tăng dần', code: 'PI' },
      { name: 'Giá giảm dần', code: 'PD' },
      { name: 'A-Z', code: 'AZ' },
      { name: 'Z-A', code: 'ZA' },
    ];
  }
  toggleFilterCategory() {
    this.isShowFilterCategory = !this.isShowFilterCategory;
  }
  toggleFilterPrice() {
    this.isShowFilterPrice = !this.isShowFilterPrice;
  }
  changePrice() {}
  onPageChange(event: any) {}
  changeSort() {}
}
