import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { delay } from 'rxjs';
//component
import OrderManagerService from 'src/app/services/admin/order-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { Order, Payment } from 'src/app/model/bill.model';

//primeNg
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Paginator } from 'src/app/model/paginator.model';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ToastModule, TableModule, PaginatorModule, MyCurrency, DialogModule, ButtonModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  isLoadingTable = false;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  orders: Order[] = [];
  titleComponent: string;
  isShowDialogPayment = false;
  payments: Payment[] = [];
  constructor(private route: ActivatedRoute, private router: Router, private orderManagerService: OrderManagerService) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.changeParams();
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;
      this.getOrders();
    });
  }
  getOrders() {
    this.isLoadingTable = true;
    this.orderManagerService
      .getAll(this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(300))
      .subscribe({
        next: (res) => {
          this.orders = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
          console.log(this.paginator.totalElements);
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  onPageChange(event: any) {
    this.paginator.pageNumber = event.page;
    this.paginator.pageSize = event.rows;
    this.paramsURL = {
      page: this.paginator.pageNumber + 1,
      size: this.paginator.pageSize,
    };

    this.addParams();
  }
  addParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsURL,
    });
  }
  showDialogPayment(payemnt: Payment) {
    this.isShowDialogPayment = true;
    this.payments[0] = payemnt;
  }
}
