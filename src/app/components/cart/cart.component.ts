import { UserInforService } from './../../services/user-infor.service';
import { Product } from './../../model/category.model';
import { Router, RouterModule } from '@angular/router';
import { Component, OnDestroy, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { mergeMap, of, Subscription } from 'rxjs';
import { CartItem } from 'src/app/model/cart.model';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { CartItemService } from 'src/app/services/cart-item.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, InputTextareaModule, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  private cartsSubscription!: Subscription;
  carts: CartItem[] = [];
  userSubject!: Subscription;
  totalQuantity: number = 0;
  totalCart: number = 0;
  constructor(
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private cartItemService: CartItemService,
    private userInforService: UserInforService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // this.cartStorageChange = this.cartStorageService.cartItemsChange.subscribe(
    //   (data) => {
    //     if (data.length === 0) {
    //       this.router.navigate(['/product/list']);
    //     }
    //     this.carts = data;
    //   }
    // );
    this.userSubject = this.tokenStorageService.userChange.subscribe({
      next: (data) => {
        this.getCartFromLocalStorage();
      },
    });
  }
  getCartFromLocalStorage() {
    this.cartsSubscription = this.cartItemService.cartItemsChange.subscribe({
      next: (response) => {
        this.carts = response;
        this.loadTotal();
      },
      error: (response) => {},
    });
  }
  loadTotal() {
    this.totalQuantity = this.carts.reduce((total, current) => {
      return total + current.quantity;
    }, 0);
    this.totalCart = this.carts.reduce((total, current) => {
      return (
        total +
        this.calcPriceDiscount(
          current.product.price,
          current.product.discount
        ) *
          current.quantity
      );
    }, 0);
  }

  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  updateQuantity(element: any, cartItem: CartItem, action: string) {
    console.log('cart');
    switch (action) {
      case '-':
        element.value--;
        break;
      case '+':
        element.value++;
        break;
      default:
        // if (!Number(element.value) || Number(element.value) < 0) {
        //   element.value = Number(1);
        // }

        break;
    }
    cartItem.quantity = Number(element.value);
    if (cartItem.quantity === 0) {
      this.remove(cartItem);
      return;
    }
    this.cartItemService
      .update(
        cartItem.id || 1000,
        cartItem.quantity,
        cartItem.product.id || 1000,
        this.userInforService.user?.id
      )
      .subscribe({
        next: (res) => {
          this.showSuccessMessage('Success', res.message);
        },
        error: (res) => {
          this.showErrorMessage('Failed', res.error.message);
          element.value--;
          cartItem.quantity = Number(element.value);
          console.log(cartItem.quantity);
        },
      });
  }
  remove(cartItem: CartItem) {
    this.cartItemService.delete(cartItem.id || 1000).subscribe({
      next: (res) => {
        this.showSuccessMessage('Success', res.message);
      },
    });
  }
  ngOnDestroy(): void {
    if (this.userSubject) {
      this.userSubject.unsubscribe();
    }
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
