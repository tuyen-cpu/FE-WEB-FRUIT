import { RouterModule } from '@angular/router';
import { UserInforService } from 'src/app/services/user-infor.service';
import { OrderService } from './../../../services/order.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Order, OrderDetail } from 'src/app/model/bill.model';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, TableModule, RouterModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  constructor(
    private orderService: OrderService,
    private userInforService: UserInforService
  ) {}

  ngOnInit(): void {
    this.orderService
      .getAllByUserId(this.userInforService.user!.id!, 0, 20)
      .subscribe({
        next: (res) => {
          this.orders = res.data.content;
          console.log(this.orders);
        },
        error: (res) => {
          console.log(res.error.message);
        },
      });
  }
}
