import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../model/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartStorageService {
  CART: string = 'cart';
  items: CartItem[] = [];
  cartItemsChange = new BehaviorSubject<CartItem[]>([]);
  //total money
  private totalCart: number = 0;
  //total number item
  private totalQuantity: number = 0;

  constructor() {
    this.items = this.getCart();
    this.cartItemsChange.next(this.items);
    this.loadTotal();
  }
  loadTotal() {
    this.totalQuantity = this.items.reduce((total, current) => {
      return total + current.quantity;
    }, 0);
    this.totalCart = this.items.reduce((total, current) => {
      console.log(current);
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
  get totalMoneyCart() {
    return this.totalCart;
  }
  get totalQuantityCart() {
    return this.totalQuantity;
  }
  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  addToCart(item: CartItem) {
    console.log(this.items);
    const product = this.items.find((i) => i.product.id === item.product.id);
    if (product) {
      this.items = this.items.map((object) => {
        if (object.product.id === item.product.id) {
          return { ...object, quantity: object.quantity + item.quantity };
        }
        return object;
      });
    } else {
      this.items.push(item);
    }

    this.saveCart();
    this.next();
    this.loadTotal();
  }
  updateCart(item: CartItem) {
    console.log(item);
    this.items = this.items.map((object) => {
      if (object.product.id === item.product.id) {
        console.log('vào true');
        return { ...object, quantity: item.quantity };
      }
      return object;
    });
    this.saveCart();
    this.next();
    this.loadTotal();
  }
  getCart(): CartItem[] {
    const d = localStorage.getItem(this.CART);
    if (d) {
      return JSON.parse(d);
    }
    return [];
  }
  remove(item: CartItem) {
    const index = this.items.findIndex(
      (i: CartItem) => i.product.id === item.product.id
    );
    if (index !== undefined) this.items.splice(index, 1);
    this.saveCart();
    this.next();
    this.loadTotal();
  }
  next() {
    console.log('vào next', this.getCart());
    this.cartItemsChange.next(this.getCart());
  }
  saveCart() {
    localStorage.setItem(this.CART, JSON.stringify(this.items));
  }

  delete() {
    localStorage.removeItem(this.CART);
  }
}
