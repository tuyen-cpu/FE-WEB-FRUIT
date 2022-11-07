import { CartStorageService } from './../../../services/cart-storage.service';
import { ImageService } from './../../../services/image.service';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Image, Product } from 'src/app/model/category.model';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, LazyLoadImageModule],
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent implements OnInit {
  @Input() product!: Product;
  image!: Image;
  constructor(
    private imageService: ImageService,
    private cartStorageService: CartStorageService
  ) {}

  ngOnInit(): void {
    this.imageService.getByProductId(this.product.id!).subscribe({
      next: (response) => {
        this.image = response.data;
      },
      error: (response) => {
        console.log(response);
      },
    });
  }
  addCart(product: Product) {
    console.log(product);
    this.cartStorageService.addToCart({ product: product, quantity: 1 });
  }
}
