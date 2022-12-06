import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { ProductItemComponent } from '../product/product-item/product-item.component';
import ProductService from 'src/app/services/product.service';
import { Category, Product } from 'src/app/model/category.model';
import { CategoryService } from 'src/app/services/category.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, CarouselModule, ProductItemComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  backgrounds: any = ['slider1.webp', 'slider2.webp', 'slider3.webp'];
  categoriesImg: any = ['1', '2', '3'];
  responsiveOptions: any;
  responsiveCateOptions: any;
  products: Product[] = [];
  categories: Category[] = [];
  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.getProducts();
    this.resonsiveCarousel();
  }
  getCategories() {
    this.categoryService.getAll().subscribe({
      next: (res) => {},
      error: (res) => {},
    });
  }
  resonsiveCarousel() {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
    this.responsiveCateOptions = [
      {
        breakpoint: '1300px',
        numVisible: 2,
        numScroll: 3,
      },
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }
  getProducts() {
    this.productService.getProductByCategorySlugAndPriceLessThan('nuoc-ep', 999999, 0, 24).subscribe({
      next: (res) => {
        this.products = res.data.content;
      },
      error: (res) => {},
    });
  }
}
