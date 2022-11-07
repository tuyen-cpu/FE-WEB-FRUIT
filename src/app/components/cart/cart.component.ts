import { Product } from './../../model/category.model';
import { Router, RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { CartItem } from 'src/app/model/cart.model';
import { CartStorageService } from 'src/app/services/cart-storage.service';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, InputTextareaModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  private cartStorageChange = new Subscription();
  carts: CartItem[] = [];
  constructor(
    private cartStorageService: CartStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartStorageChange = this.cartStorageService.cartItemsChange.subscribe(
      (data) => {
        if (data.length === 0) {
          this.router.navigate(['/product/list']);
        }
        this.carts = data;
      }
    );
  }
  getTotalMoneyCart() {
    return this.cartStorageService.totalMoneyCart;
  }
  getTotalQuantityCart() {
    return this.cartStorageService.totalQuantityCart;
  }
  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  updateQuantity(element: any, cartItem: CartItem, action: string) {
    switch (action) {
      case '-':
        if (Number(element.value) >= 2) element.value--;
        break;
      case '+':
        element.value++;
        break;
      default:
        if (!Number(element.value) || Number(element.value) < 0) {
          element.value = Number(1);
        }

        break;
    }
    cartItem.quantity = Number(element.value);
    this.cartStorageService.updateCart(cartItem);
  }
  remove(cartItem: CartItem) {
    this.cartStorageService.remove(cartItem);
  }
}
