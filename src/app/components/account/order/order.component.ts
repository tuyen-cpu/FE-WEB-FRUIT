import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { delay, Subscription } from 'rxjs';
import { Location } from '@angular/common';
//primeNg

import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { OrderFilter } from 'src/app/model/filter.model';
import { CalendarModule } from 'primeng/calendar';

//component
import { TokenStorageService } from './../../../services/token-storage.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { UserInforService } from 'src/app/services/user-infor.service';
import { OrderService } from './../../../services/order.service';
import { EStatusShipping } from 'src/app/model/status-shipping.enum';
import { Paginator } from 'src/app/model/paginator.model';
import { Order, OrderDetail, PaymentMethod, ShippingStatus } from 'src/app/model/bill.model';
import ShippingStatusService from '../../../services/admin/shipping-status.service';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    InputTextModule,
    RouterModule,
    MyCurrency,
    ConfirmDialogModule,
    PaginatorModule,
    TranslateModule,
    CalendarModule,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
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
  datesFilter: Date[] = [];
  filter: OrderFilter = { page: 0, size: 10 };
  statusFilterSelected: ShippingStatus;
  flagFilter = false;
  isLoadingTable = false;
  listStatuses: any[] = [];
  maxDateValue = new Date();
  constructor(
    private orderService: OrderService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private _location: Location,
    private messageService: MessageService,
    private shippingStatusService: ShippingStatusService,
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
    this.getShippingStatus();
  }
  getShippingStatus(){
    this.shippingStatusService.getAll().subscribe({
      next:(res)=>{
        this.listStatuses = res.data
      }
    })
  }
  getAll() {
    this.flagFilter = false;
    this.isLoadingTable = true;
    this.orderService.getAllByUserId(this.userInforService.user!.id!, this.paginator.pageNumber, this.paginator.pageSize).pipe(delay(400)).subscribe({
      next: (res) => {
        this.orders = res.data.content;
        console.log(this.orders);
        this.isLoadingTable = false;
        this.paginator.totalElements = res.data.totalElements;
      },
      error: (res) => {
        console.log(res.error.message);
        this.isLoadingTable = false;
        this.orders = [];
      },
    });
  }
  onCancelOrder(order: Order) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to cancel this order?',
      accept: () => {
        this.orderService.setCancel(order).subscribe({
          next: (res) => {
            this.getAll();

            if (order.payment.paymentMethod === PaymentMethod.PAYPAL) {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Staff will contact you to confirm your order cancellation request. Money will be refunded to your account in 5-6 days',
                life: 4000,
              });
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff will contact you to confirm your request.',
              life: 4000,
            });
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
      if (this.hasValueFilter()) {
        this.filterOrder();
        return;
      }
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

  onSelectDateFilter() {
    this.filter.createdDate = this.convertDateToString(this.datesFilter);
  }
  onClearDate() {
    this.filter.createdDate = undefined;
    this.checkAllWithoutFilter();
  }
  convertDateToString(dates: Date[]): string[] {
    return dates.map((date) => this.datePipe.transform(date, 'yyyy-MM-dd'));
  }
  checkAllWithoutFilter() {
    if (!this.hasValueFilter()) {
      this.paginator.pageNumber = 0;
      this.paginator.pageSize = 10;
      this.paramsURL = {
        page: this.paginator.pageNumber + 1,
        size: this.paginator.pageSize,
      };

      this.addParams();
      if (this.flagFilter) {
        this.getAll();
      }
    }
  }
  onFilterOrders() {
    this.resetFilterPaginator();
    this.resetPaginator();
    this.filterOrder();
  }
  filterOrder() {
    this.isLoadingTable = true;
    this.flagFilter = true;
    this.filter.page = this.paginator.pageNumber;
    this.filter.size = this.paginator.pageSize;
    this.orderService
      .filter(this.filter)
      .pipe(delay(500))
      .subscribe({
        next: (res: any) => {
          this.orders = res.data.content;

          this.paginator.totalElements = res.data.totalElements;
          this.isLoadingTable = false;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  resetPaginator() {
    this.paginator.pageNumber = 0;
    this.paginator.pageSize = 10;
    this.paramsURL = {
      page: this.paginator.pageNumber + 1,
      size: this.paginator.pageSize,
    };

    this.addParams();
  }
  resetFilterPaginator() {
    this.filter.page = 0;
    this.filter.size = 10;
  }
  hasValueFilter() {
    return this.statusFilterSelected || this.filter.address || (this.datesFilter && this.datesFilter.length);
  }
  onChangeStatusFilter() {
    this.filter.shippingStatusId = this.statusFilterSelected ? this.statusFilterSelected.id : undefined;
    this.checkAllWithoutFilter();
  }
  ngOnDestroy(): void {
    if (this.userSupscription) {
      this.userSupscription.unsubscribe();
    }
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  backToPreviousPage() {
    this._location.back();
  }
}
