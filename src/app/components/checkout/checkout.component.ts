import { OrderService } from './../../services/order.service';
import { Checkout, OrderDetail } from './../../model/bill.model';
import { Subscription, switchMap } from 'rxjs';
import { CartItemService } from './../../services/cart-item.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { District, Province, Ward } from 'src/app/model/province.model';
import { ProvincesApiService } from 'src/app/services/provinces-api.service';
import { render } from 'creditcardpayments/creditCardPayments';
import { UserInforService } from 'src/app/services/user-infor.service';
import { User } from 'src/app/model/user.model';
import { CartItem } from 'src/app/model/cart.model';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    RadioButtonModule,
    DropdownModule,
    InputTextareaModule,
    RippleModule,
    RouterModule,
    MessagesModule,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutComponent implements OnInit {
  voucherInput!: string;
  vouchers: any[] = [];
  isLoading = false;
  regexNumPhone: any = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  payment: any = 'PAYPAL';

  provinces!: Province[];
  districts!: District[];
  wards!: Ward[];
  infoForm!: FormGroup;

  cartItems: CartItem[] = [];
  totalQuantity: number = 0;
  totalCart: number = 0;
  cartItemsChange!: Subscription;
  constructor(
    private fb: FormBuilder,
    private primengConfig: PrimeNGConfig,
    private provincesApi: ProvincesApiService,
    private messageService: MessageService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private cartItemService: CartItemService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.renderPaypal();
    this.initForm();
    this.primengConfig.ripple = true;
    this.getProvinces();
    this.getCartItems();
  }
  getCartItems() {
    this.cartItemsChange = this.cartItemService.cartItemsChange.subscribe(
      (data) => {
        if (data.length === 0) {
          this.router.navigate(['/']);
        }
        this.cartItems = data;
        this.loadTotal();
      }
    );
  }
  getProvinces() {
    this.provincesApi.getProvinces().subscribe({
      next: (provinces: Province[]) => {
        this.provinces = provinces;
      },
    });
  }
  renderPaypal() {
    render({
      id: '#myPaypalButton',
      currency: 'USD',
      // value:
      //   '' + ~~((this.totalCart + this.shippingCost - this.discount) / 23.4),
      value: '' + 10000,
      onApprove: (details) => {
        this.onSubmit();
      },
    });
  }
  onChangeProvince(e: any) {
    this.provincesApi.getDistricts(e.value.code).subscribe({
      next: (province: Province) => {
        console.log(province);
        this.districts = province.districts!;
      },
    });
  }
  onChangeDistrict(e: any) {
    this.provincesApi.getCommunes(e.value.code).subscribe({
      next: (district: District) => {
        this.wards = district.wards!;
      },
    });
  }
  onSubmit() {
    this.isLoading = true;
    const valueForm = this.infoForm.value;
    console.log(valueForm);
    let orderDetails: OrderDetail[] = this.cartItems.map((item) => {
      return {
        price: item.product.price,
        quantity: item.quantity,
        discount: item.product.discount || 0,
        productId: item.product.id || 222222,
      };
    });
    let checkout: Checkout = {
      description: 'Mô tả thôi',
      shippingCost: 300000,
      // address: {
      //   city: valueForm.province.name,
      //   district: valueForm.district.name,
      //   ward: valueForm.ward.name,
      //   street: valueForm.street,
      //   status: 1,
      //   userId: this.getUser().id!,
      //   description: 'chỉ là description',
      // },
      userId: this.getUser().id,
      address: 'wwqwqwqwqew',
      orderDetails: orderDetails,
    };
    this.orderService
      .checkout(checkout)
      .pipe(
        switchMap((_) =>
          this.cartItemService.deleteByUserId(this.getUser().id!)
        )
      )
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/account/order']);
        },
        error: (res) => {
          this.isLoading = false;
          alert(res.error.message);
        },
      });
  }
  onCheckVoucher() {
    this.isLoading = true;
    if (this.voucherInput.length > 20) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Service Message',
        detail: 'Mã không hợp lệ',
      });
      this.isLoading = false;
      return;
    }

    setTimeout(() => {
      this.vouchers.push(this.voucherInput);
      this.isLoading = false;
    }, 1000);
  }
  onRemoveVoucher(voucher: string) {
    this.vouchers = this.vouchers.filter((v) => v !== voucher);
  }

  getUser(): User {
    return this.userInforService.user!;
  }
  logout() {
    this.tokenStorageService.signOut();
  }
  initForm() {
    this.infoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      phoneNum: [
        '',
        [Validators.required, Validators.pattern(this.regexNumPhone)],
      ],
      street: ['', [Validators.required, Validators.minLength(3)]],
      province: [null, Validators.required],
      district: [null, Validators.required],
      ward: [null, Validators.required],
      notes: [''],
    });
  }
  get email() {
    return this.infoForm.get('email');
  }
  get name() {
    return this.infoForm.get('name');
  }
  get phoneNum() {
    return this.infoForm.get('phoneNum');
  }
  get street() {
    return this.infoForm.get('street');
  }
  get province() {
    return this.infoForm.get('province');
  }
  get notes() {
    return this.infoForm.get('notes');
  }
  loadTotal() {
    this.totalQuantity = this.cartItems.reduce((total, current) => {
      return total + current.quantity;
    }, 0);
    this.totalCart = this.cartItems.reduce((total, current) => {
      return (
        total +
        this.calcPriceDiscount(
          current.product.price,
          current.product.discount
        ) *
          current.quantity
      );
    }, 0);
  }
  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
}
