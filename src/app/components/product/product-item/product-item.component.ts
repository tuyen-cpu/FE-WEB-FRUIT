import { FileUploadService } from './../../../services/file-upload.service';
import { UserInforService } from './../../../services/user-infor.service';
import { CartItemService } from './../../../services/cart-item.service';
import { ImageService } from './../../../services/image.service';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Image, Product } from 'src/app/model/category.model';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [
    CommonModule,
    LazyLoadImageModule,
    ToastModule,
    MyCurrency,
    RouterModule,
  ],
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
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.urlImage = this.fileUploadService.getLink();
  }
  addCart(product: Product) {
    if (this.userInforService.user) {
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
    this.router.navigate(['/account/login']);
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
