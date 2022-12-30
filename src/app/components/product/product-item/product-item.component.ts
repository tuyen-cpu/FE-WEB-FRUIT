import { ShareMessageService } from 'src/app/services/share-message.service';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

//primeng
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LazyLoadImageModule } from 'ng-lazyload-image';

//component
import { FileUploadService } from './../../../services/file-upload.service';
import { UserInforService } from './../../../services/user-infor.service';
import { CartItemService } from './../../../services/cart-item.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { Image, Product } from 'src/app/model/category.model';
@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, LazyLoadImageModule, ToastModule, MyCurrency, RouterModule, TranslateModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductItemComponent implements OnInit {
  @Input() product!: Product;
  image!: Image;
  urlImage!: string;
  constructor(
    private cartItemService: CartItemService,
    private userInforService: UserInforService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fileUploadService: FileUploadService,
    private shareMessageService: ShareMessageService,
  ) {}

  ngOnInit(): void {
    this.urlImage = this.fileUploadService.getLink();
  }
  addCart(product: Product) {
    console.log('vao add to cart');
    if (this.userInforService.user) {
      if (this.userInforService.user.roles.some((e) => e === 'admin' || e === 'manager')) {
        this.shareMessageService.errorMessage.next('Cannot add to cart');
        return;
      }
      this.cartItemService
        .add({
          product: product,
          userId: this.userInforService.user.id,
          quantity: 1,
        })
        .subscribe({
          next: (response) => {
            this.showSuccessMessage('Success', response.message);
          },
          error: (response) => {
            this.showErrorMessage('Error', response.error.message);
          },
        });
      return;
    }
    this.router.navigate(['/auth/login']);
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
}
