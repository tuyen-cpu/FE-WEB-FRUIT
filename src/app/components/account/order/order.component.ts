import { TokenStorageService } from './../../../services/token-storage.service';
import { Subscription } from 'rxjs';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { Router, RouterModule } from '@angular/router';
import { UserInforService } from 'src/app/services/user-infor.service';
import { OrderService } from './../../../services/order.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Order, OrderDetail } from 'src/app/model/bill.model';
import { EStatusShipping } from 'src/app/model/status-shipping.enum';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterModule,
    MyCurrency,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  userSupscription!: Subscription;
  constructor(
    private orderService: OrderService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    console.log(EStatusShipping.UNVERIFIED);
    this.userSupscription = this.tokenStorageService.userChange.subscribe(
      (data) => {
        if (data) {
          this.getAll();
          return;
        }
        this.router.navigate(['/']);
      }
    );
  }
  getAll() {
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
  ngOnDestroy(): void {
    if (this.userSupscription) {
      this.userSupscription.unsubscribe();
    }
  }
}
