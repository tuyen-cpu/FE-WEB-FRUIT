import { TokenStorageService } from './../../../services/token-storage.service';
import { Subscription } from 'rxjs';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserInforService } from 'src/app/services/user-infor.service';
import { OrderService } from './../../../services/order.service';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Order, OrderDetail } from 'src/app/model/bill.model';
import { EStatusShipping } from 'src/app/model/status-shipping.enum';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Paginator } from 'src/app/model/paginator.model';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ToastModule, TableModule, InputTextModule, RouterModule, MyCurrency, ConfirmDialogModule, PaginatorModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  orders: Order[] = [];
  userSupscription!: Subscription;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  isLoadingComponent = false;
  constructor(
    private orderService: OrderService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.changeParams();
    this.userSupscription = this.tokenStorageService.userChange.subscribe((data) => {
      if (data) {
        // this.getAll();
        return;
      }
      this.router.navigate(['/']);
    });
  }
  getAll() {
    this.isLoadingComponent = true;
    this.orderService.getAllByUserId(this.userInforService.user!.id!, this.paginator.pageNumber, this.paginator.pageSize).subscribe({
      next: (res) => {
        this.orders = res.data.content;
        console.log(this.orders);
        this.isLoadingComponent = false;
        this.paginator.totalElements = res.data.totalElements;
      },
      error: (res) => {
        console.log(res.error.message);
        this.isLoadingComponent = false;
      },
    });
  }
  onCancelOrder(order: Order) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.orderService.setCancel(order).subscribe({
          next: (res) => {
            this.getAll();
          },
          error: (res) => {
            console.log(res.error.message);
          },
        });
      },
      reject: (type: any) => {
        // switch (type) {
        //   case ConfirmEventType.REJECT:
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'Rejected',
        //       detail: 'You have rejected',
        //     });
        //     break;
        //   case ConfirmEventType.CANCEL:
        //     this.messageService.add({
        //       severity: 'warn',
        //       summary: 'Cancelled',
        //       detail: 'You have cancelled',
        //     });
        //     break;
        // }
      },
    });
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;

      this.getAll();
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
  ngOnDestroy(): void {
    if (this.userSupscription) {
      this.userSupscription.unsubscribe();
    }
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}
