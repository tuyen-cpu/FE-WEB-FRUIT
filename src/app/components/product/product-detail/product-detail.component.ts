import { UserInforService } from 'src/app/services/user-infor.service';
import { ActivatedRoute } from '@angular/router';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperModule } from 'swiper/angular';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';
import ProductService from 'src/app/services/product.service';
import { Product } from 'src/app/model/category.model';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { CartItemService } from 'src/app/services/cart-item.service';
import { CartItem } from 'src/app/model/cart.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
// install Swiper modules
SwiperCore.use([FreeMode, Navigation, Thumbs]);
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, SwiperModule, MyCurrency, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailComponent implements OnInit {
  thumbsSwiper: any;
  product!: Product;
  quantity: number = 1;
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartItemService: CartItemService,
    private userInforService: UserInforService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getProduct();
  }
  getProduct() {
    this.productService
      .getById(+this.route.snapshot.paramMap.get('product-id')!)
      .subscribe({
        next: (res) => {
          this.product = res.data;
        },
        error: (res) => {},
      });
  }
  onChangeQuantity(e: any, action: string) {
    switch (action) {
      case '-':
        e.value <= 1 ? (e.value = 1) : e.value--;

        break;
      case '+':
        e.value > 50 ? (e.value = 50) : e.value++;

        break;
      default:
        break;
    }
    this.quantity = +e.value;
  }
  addToCart() {
    console.log();
    this.cartItemService
      .add({
        product: this.product,
        userId: this.userInforService.user?.id,
        quantity: this.quantity,
      })
      .subscribe({
        next: (response) => {
          this.showSuccessMessage('Success', response.message);
        },
        error: (response) => {
          this.showErrorMessage('Error', response.error.message);
        },
      });
  }
  calcPrice(price: number, percent: number = 0): number {
    return price - (price * percent) / 100;
  }
  showSuccessMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 1000,
    });
  }
  showErrorMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
    });
  }
}