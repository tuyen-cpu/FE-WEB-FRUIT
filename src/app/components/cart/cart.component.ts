import { Router, RouterModule } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

//component
import { MyCurrency } from './../../pipes/my-currency.pipe';
import { FileUploadService } from './../../services/file-upload.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UserInforService } from './../../services/user-infor.service';
import { CartItemService } from 'src/app/services/cart-item.service';

//model
import { CartItem } from 'src/app/model/cart.model';

//primeNg
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, InputTextareaModule, ToastModule, MyCurrency, SkeletonModule],
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
  urlImage!: string;
  constructor(
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private cartItemService: CartItemService,
    private userInforService: UserInforService,
    private messageService: MessageService,
    private fileUploadService: FileUploadService,
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
    this.urlImage = this.fileUploadService.getLink();
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
      return total + this.calcPriceDiscount(current.product.price, current.product.discount) * current.quantity;
    }, 0);
  }

  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  updateQuantity(element: any, cartItem: CartItem, action: string) {
    console.log('cart');
    switch (action) {
      case '-':
        // element.value--;
        cartItem.quantity--;
        break;
      case '+':
        // element.value++;
        cartItem.quantity++;
        break;
      default:
        // if (!Number(element.value) || Number(element.value) < 0) {
        //   element.value = Number(1);
        // }

        break;
    }
    // cartItem.quantity = Number(element.value);
    if (cartItem.quantity === 0) {
      this.remove(cartItem);
      return;
    }
    this.cartItemService.update(cartItem.id || 1000, cartItem.quantity, cartItem.product.id || 1000, this.userInforService.user?.id).subscribe({
      next: (res) => {
        this.showSuccessMessage('Success', res.message);
      },
      error: (res) => {
        this.showErrorMessage('Failed', res.error.message);
        // element.value--;
        // cartItem.quantity = Number(element.value);
        cartItem.quantity--;
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
  trackById(index: number, item: any) {
    return item.id;
  }
}
