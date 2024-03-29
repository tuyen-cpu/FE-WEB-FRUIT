import { EStatusShipping } from 'src/app/model/status-shipping.enum';
import { FileUploadService } from './../../services/file-upload.service';
import { FileUploadModule } from 'primeng/fileupload';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
//component
import OrderManagerService from 'src/app/services/admin/order-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { EStatusPayment, Order, OrderDetail, Payment, ShippingStatus } from 'src/app/model/bill.model';
import { OrderFilter } from 'src/app/model/filter.model';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';
//primeNg
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Paginator } from 'src/app/model/paginator.model';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

import { OrderDetailService } from 'src/app/services/order-detail.service';
import ShippingStatusService from '../../services/admin/shipping-status.service';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    PaginatorModule,
    MyCurrency,
    DialogModule,
    ButtonModule,
    CalendarModule,
    InputTextModule,
    HighlighterPipe,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements OnInit, OnDestroy {
  isLoadingTable = false;
  isLoading = false;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  orders: Order[] = [];
  titleComponent: string;
  isShowDialogPayment = false;
  payments: Payment[] = [];
  filter: OrderFilter = { page: 0, size: 10 };
  private subjectKeyup = new Subject<any>();
  listStatuses: any[] = [];
  statusFilterSelected: ShippingStatus;
  isExpanded: boolean = false;
  orderDetails: OrderDetail[] = [];
  isShowOrderDetail = false;
  expandedRows = {};
  urlImage: string;
  datesFilter: Date[] = [];
  paymentStatusList = [
    { name: 'PAID', id: 1 },
    { name: 'UNPAID', id: 2 },
  ];
  paymentMethodList = [
    { name: 'PAYPAL', id: 1 },
    { name: 'COD', id: 2 },
  ];
  paymentStatusFilter: { name: string; id: number };
  paymentMethodFilter: { name: string; id: number };
  flagFilter = false;
  editDialog = false;
  maxDateValue = new Date();
  orderEdit: Order;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private orderManagerService: OrderManagerService,
    public datepipe: DatePipe,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private shippingStatusService: ShippingStatusService,
    private fileUploadService: FileUploadService,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.changeParams();
    this.urlImage = this.fileUploadService.getLink();
    // this.listStatuses = [
    //   { name: EStatusShipping.VERIFIED, id: 1 },
    //   { name: EStatusShipping.UNVERIFIED, id: 2 },
    //   { name: EStatusShipping.DELIVERING, id: 3 },
    //   { name: EStatusShipping.DELIVERED, id: 4 },
    //   { name: EStatusShipping.CANCELED, id: 5 },
    //   { name: EStatusShipping.CANCELING, id: 6 },
    // ];
    this.getShippingStatus();

  }
  getShippingStatus(){
    this.shippingStatusService.getAll().subscribe({
      next:(res)=>{
        this.listStatuses = res.data
      }
    })
  }
  clearFilterAddress() {
    this.filter.address = undefined;
    this.checkAllWithoutFilter();
  }
  onChangeStatusFilter() {
    this.filter.shippingStatusId = this.statusFilterSelected ? this.statusFilterSelected.id : undefined;
    this.checkAllWithoutFilter();
  }
  onChangePaymentStatusFilter() {
    if (!this.paymentStatusFilter) {
      this.paymentMethodList = [
        { name: 'PAYPAL', id: 1 },
        { name: 'COD', id: 2 },
      ];
    } else {
      if (this.paymentStatusFilter && this.paymentStatusFilter.id === 1) {
        this.paymentMethodList = [{ name: 'PAYPAL', id: 1 }];
      } else {
        this.paymentMethodList = [{ name: 'COD', id: 2 }];
      }
    }

    this.filter.payment = { ...this.filter.payment, status: this.paymentStatusFilter ? this.paymentStatusFilter.name : undefined };
    this.checkAllWithoutFilter();
  }

  onChangePaymentMethodFilter() {
    console.log(this.paymentMethodFilter);
    if (!this.paymentMethodFilter) {
      this.paymentStatusList = [
        { name: 'PAID', id: 1 },
        { name: 'UNPAID', id: 2 },
      ];
    } else {
      if (this.paymentMethodFilter && this.paymentMethodFilter.id === 1) {
        this.paymentStatusList = [{ name: 'PAID', id: 1 }];
      } else {
        this.paymentStatusList = [{ name: 'UNPAID', id: 2 }];
      }
    }

    this.filter.payment = { ...this.filter.payment, paymentMethod: this.paymentMethodFilter ? this.paymentMethodFilter.name : undefined };
    this.checkAllWithoutFilter();
  }
  onFilterOrders() {
    this.resetFilterPaginator();
    this.resetPaginator();
    this.filterOrder();
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
  onSelectDateFilter() {
    this.filter.createdDate = this.convertDateToString(this.datesFilter);
  }
  convertDateToString(dates: Date[]): string[] {
    return dates.map((date) => this.datePipe.transform(date, 'yyyy-MM-dd'));
  }
  onClearDate() {
    this.filter.createdDate = undefined;
    this.checkAllWithoutFilter();
  }
  hasValueFilter() {
    return (
      this.statusFilterSelected ||
      this.paymentMethodFilter ||
      this.paymentStatusFilter ||
      this.filter.address ||
      (this.datesFilter && this.datesFilter.length)
    );
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
        this.getOrders();
      }
    }
  }

  clearFilter() {
    this.filter = { page: 0, size: 10 };
    this.statusFilterSelected = undefined;
    this.getOrders();
  }
  filterOrder() {
    this.isLoadingTable = true;
    this.flagFilter = true;
    this.filter.page = this.paginator.pageNumber;
    this.filter.size = this.paginator.pageSize;
    this.orderManagerService
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
      // if (this.filter.address || this.filter.createdDate) {
      //   this.filter.page = res['page'] - 1;
      //   this.filter.size = Number(res['size']);
      //   console.log(this.filter);
      //   this.filterOrder();
      //   return;
      // }
      this.getOrders();
    });
  }
  getOrders() {
    this.flagFilter = false;
    this.isLoadingTable = true;
    this.orderManagerService
      .getAll(this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(300))
      .subscribe({
        next: (res) => {
          this.orders = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  changeShippingStatuss() {
    this.isLoading = true;
    this.orderManagerService.updateStatus(this.orderEdit).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.editDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Record updated' });
        this.getOrders();
      },
      error: (res) => {
        this.getOrders();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error.message });
      },
    });
  }
  // changeShippingStatus(event, order: Order) {
  //   console.log(event.value);
  //   this.isLoadingTable = true;
  //   this.confirmationService.confirm({
  //     message: 'Do you want to update this order?',
  //     header: 'Update Confirmation',
  //     icon: 'pi pi-info-circle',
  //     accept: () => {
  //       let orderUpdate = { ...order };
  //       this.orderManagerService.updateStatus(orderUpdate).subscribe({
  //         next: (res) => {
  //           this.isLoadingTable = false;
  //           this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Record updated' });
  //         },
  //         error: (res) => {
  //           this.getOrders();
  //           this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error.message });
  //         },
  //       });
  //     },
  //     reject: (type) => {
  //       switch (type) {
  //         case ConfirmEventType.REJECT:
  //           this.getOrders();
  //           this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
  //           break;
  //         case ConfirmEventType.CANCEL:
  //           this.getOrders();
  //           this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
  //           break;
  //       }
  //     },
  //   });
  // }
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
  isEmptyFilter(): boolean {
    return !this.filter.createdDate && !this.filter.address;
  }
  showDetail(id: number) {
    this.isLoadingTable = true;
    this.orderManagerService
      .getByOrderId(id)
      .pipe(delay(100))
      .subscribe({
        next: (res) => {
          this.isLoadingTable = false;
          this.isShowOrderDetail = !this.isShowOrderDetail;
          this.orderDetails = res.data;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  editOrder(order: Order) {
    this.orderEdit = { ...order };
    this.editDialog = true;
    console.log(this.orderEdit)
  }
  hideDialog() {
    this.editDialog = false;
  }
  ngOnDestroy(): void {
    if (this.subjectKeyup) {
      this.subjectKeyup.unsubscribe();
    }
  }
}
