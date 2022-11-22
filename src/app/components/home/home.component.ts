import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { ProductItemComponent } from '../product/product-item/product-item.component';
import ProductService from 'src/app/services/product.service';
import { Product } from 'src/app/model/category.model';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule,
    CarouselModule,
    ProductItemComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  backgrounds: any = ['slider1.webp', 'slider2.webp', 'slider3.webp'];
  categories: any = ['1', '2', '3'];
  responsiveOptions: any;
  responsiveCateOptions: any;
  products: Product[] = [];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getProducts();
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 3,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 3,
      },
    ];
    this.responsiveCateOptions = [
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 3,
      },
    ];
  }
  getProducts() {
    this.productService
      .getProductByCategoryIdAndPriceLessThan(3, 999999, 0, 24)
      .subscribe({
        next: (res) => {
          this.products = res.data.content;
        },
        error: (res) => {},
      });
  }
}
