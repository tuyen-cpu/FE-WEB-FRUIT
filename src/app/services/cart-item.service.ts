import { UserInforService } from './user-infor.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../model/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  REST_API = 'http://localhost:3000/api/cart';
  cartItemsChange = new BehaviorSubject<CartItem[]>([]);
  constructor(
    private httpClient: HttpClient,
    private userInforService: UserInforService
  ) {
    if (this.userInforService.user) {
      this.getAllByUserId(this.userInforService.user.id || 1000).subscribe({
        next: (res) => {
          this.cartItemsChange.next(res.data.content);
        },
      });
    }
  }
  getAllByUserId(userId: number): Observable<any> {
    return this.httpClient.get(`${this.REST_API}/${userId}`);
  }
  add(cartItem: CartItem): Observable<any> {
    return this.httpClient
      .post(`${this.REST_API}/add`, {
        quantity: cartItem.quantity,
        productId: cartItem.product.id,
        userId: cartItem.userId,
      })
      .pipe(
        tap((res: any) => {
          const carts = this.cartItemsChange.getValue();
          let newCarts: any[] = [];
          if (carts.find((e) => e.product.id === res.data.product.id)) {
            newCarts = carts.map((e) => {
              if (e.product.id === res.data.product.id) {
                e.quantity++;
                return e;
              } else {
                return e;
              }
            });
          } else {
            const ttt = carts.filter((o) => {
              return o.product.id !== res.data.product.id;
            });
            newCarts = [...ttt, res.data];
          }

          this.next(newCarts);
        })
      );
  }
  update(
    id: number,
    quantity: number,
    productId: number,
    userId?: number
  ): Observable<any> {
    return this.httpClient
      .put(`${this.REST_API}/update`, {
        id,
        quantity,
        productId,
        userId,
      })
      .pipe(
        tap((res: any) => {
          const newCarts = this.cartItemsChange
            .getValue()
            .map((obj) => (obj.product.id === productId ? res.data : obj));
          this.next(newCarts);
        })
      );
  }
  delete(id: number): Observable<any> {
    return this.httpClient.delete(`${this.REST_API}/delete/${id}`).pipe(
      tap((res: any) => {
        console.log('xoá', id);
        const carts = this.cartItemsChange.getValue();

        const indexOfObject = carts.findIndex((object) => {
          return object.id === id;
        });
        carts.splice(indexOfObject, 1);
        this.next(carts);
      })
    );
  }
  deleteByUserId(userId: number) {
    return this.httpClient
      .delete(`${this.REST_API}/delete/user/${userId}`)
      .pipe(
        tap((res) => {
          this.next([]);
        })
      );
  }
  next(carts: CartItem[]) {
    this.cartItemsChange.next(carts);
  }
}
