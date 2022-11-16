import { OrderDetailService } from './../../../services/order-detail.service';
import { OrderService } from './../../../services/order.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { Order, OrderDetailRequest } from 'src/app/model/bill.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { myCurrency } from 'src/app/pipes/my-currency.pipe';
import { TokenStorageService } from 'src/app/services/token-storage.service';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, TableModule, RouterModule, myCurrency, ButtonModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderDetailComponent implements OnInit {
  orderId!: number;
  orderDetails: OrderDetailRequest[] = [];
  subTotal: number = 0;
  order!: Order;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private tokenStorageService: TokenStorageService,
    private orderDetailService: OrderDetailService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.orderId = Number(paramMap.get('orderId'));
      this.getOrderDetails();
      this.getOrder();
    });
  }

  getOrderDetails() {
    this.orderDetailService.getByOrderId(this.orderId).subscribe({
      next: (res) => {
        this.orderDetails = res.data;
        console.log(this.orderDetails);
        this.subTotal = this.orderDetails.reduce((prev, current) => {
          return (
            prev +
            (current.price - (current.price * current.discount) / 100) *
              current.quantity
          );
        }, 0);
      },
      error: (res) => {},
    });
  }
  getOrder() {
    this.orderService.getAllById(this.orderId).subscribe({
      next: (res) => {
        this.order = res.data;
      },
      error: (res) => {},
    });
  }
  logout() {
    this.tokenStorageService.signOut();
  }
}
