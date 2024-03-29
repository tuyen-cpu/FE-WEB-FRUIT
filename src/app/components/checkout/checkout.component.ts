import { FileUploadService } from './../../services/file-upload.service';
import { EStatusShipping } from './../../model/status-shipping.enum';
import { LoadingComponent } from './../../utils/loading/loading.component';
import { Address } from './../../model/address.model';
import { OrderService } from './../../services/order.service';
import { Checkout, EStatusPayment, OrderDetail, PaymentMethod } from './../../model/bill.model';
import { Subscription, switchMap, map } from 'rxjs';
import { CartItemService } from './../../services/cart-item.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, ViewEncapsulation, EventEmitter, OnDestroy } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService, PrimeNGConfig, ConfirmationService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { District, Province, Ward } from 'src/app/model/province.model';
import { ProvincesApiService } from 'src/app/services/provinces-api.service';
import { render } from 'creditcardpayments/creditCardPayments';
import { UserInforService } from 'src/app/services/user-infor.service';
import { User } from 'src/app/model/user.model';
import { CartItem } from 'src/app/model/cart.model';
import { AddressService } from 'src/app/services/address.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { phoneNum } from 'src/app/utils/regex';
import { ShareMessageService } from 'src/app/services/share-message.service';
import { TranslateModule } from '@ngx-translate/core';

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
    LoadingComponent,
    MyCurrency,
    ConfirmDialogModule,
    DialogModule,
    TranslateModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  voucherInput!: string;
  vouchers: any[] = [];
  isLoading = false;
  isLoadingComponent = false;
  regexNumPhone: any = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  payment: any = 'PAYPAL';
  payer!: string;
  emailPayer!: string;
  statusPayment!: EStatusPayment;
  paymentMethod!: PaymentMethod;
  payInAdvace: boolean = false;
  provinces!: Province[];
  districts!: District[];
  wards!: Ward[];
  infoForm!: FormGroup;
  addresses: { name: string; address: Address }[] = [];
  cartItems: CartItem[] = [];
  totalQuantity: number = 0;
  totalCart: number = 0;
  cartItemsChange!: Subscription;
  addressSeleted!: { name: string };
  addressTemp: { city?: Province; ward?: Ward; district?: District } = {};
  urlImage!: string;
  displayConfirm: boolean = false;
  contentConfirm = '';
  shippingCost: number = 0;
  errorCart!: string;
  constructor(
    private fb: FormBuilder,
    private primengConfig: PrimeNGConfig,
    private provincesApi: ProvincesApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userInforService: UserInforService,
    private tokenStorageService: TokenStorageService,
    private cartItemService: CartItemService,
    private orderService: OrderService,
    private router: Router,
    private addressService: AddressService,
    private fileUploadService: FileUploadService,
    private shareMessageService: ShareMessageService,
  ) {}

  ngOnInit(): void {
    this.urlImage = this.fileUploadService.getLink();

    this.initForm();
    this.primengConfig.ripple = true;
    this.getProvinces();
    this.getCartItems();
    // this.getAddresses();
    this.renderPaypal();
  }
  autoSelectAddressDefault() {
    this.isLoading = true;
    let address = this.addresses.find((e) => e.address.isDefault) ? this.addresses.find((e) => e.address.isDefault).address : undefined;
    if (address) {
      this.addressTemp.city = this.provinces.find((e) => e.name === address.city)!;
      if (this.addressTemp.city) {
        this.provincesApi
          .getDistricts(this.addressTemp.city.code!)
          .pipe(
            switchMap((province: Province) => {
              this.districts = province.districts!;
              this.addressTemp.district = this.districts.find((e) => e.name === address.district)!;
              return this.provincesApi.getCommunes(this.addressTemp.district.code!);
            }),
          )
          .subscribe({
            next: (district: District) => {
              this.wards = district.wards!;
              this.addressTemp.ward = this.wards.find((e) => e.name === address.ward)!;
              this.infoForm.patchValue({
                firstName: address.firstName,
                lastName: address.lastName,
                phoneNum: address.phone,
                street: address.street,
                province: this.addressTemp.city,
                district: this.addressTemp.district,
                ward: this.addressTemp.ward,
              });
            },
            error: (res) => {
              this.isLoading = false;
            },
          });
      }
    }

    this.isLoading = false;
  }
  remove(cartItem: CartItem) {
    this.cartItemService.delete(cartItem.id).subscribe({
      next: (res) => {},
    });
  }
  getCartItems() {
    this.cartItemsChange = this.cartItemService
      .getAllByUserId(this.userInforService.user.id)
      .pipe(
        switchMap((res) => {
          this.cartItemService.cartItemsChange.next(res.data.content);
          return this.cartItemService.cartItemsChange;
        }),
      )
      .subscribe({
        next: (data) => {
          console.log(data);
          if (data.length === 0) {
            this.router.navigate(['/']);
          }
          this.cartItems = data;
          if (this.cartItems.some((item) => item.product.quantity < item.quantity)) {
            this.errorCart = 'There are some products that do not have enough quantity. Please go back to cart to check.';
          } else if (this.cartItems.some((item) => !item.product.status)) {
            this.errorCart = 'Some products are not available. Please go back to cart to check.';
          } else {
            this.errorCart = '';
          }

          this.loadTotal();
          this.shippingCost = this.totalCart > 250000 ? 0 : 30000;
        },
      });
  }
  getProvinces() {
    this.provincesApi.getProvinces().subscribe({
      next: (provinces: Province[]) => {
        this.provinces = provinces;
        this.getAddresses();
      },
    });
  }
  getAddresses() {
    this.isLoading = true;
    this.addressService.getByUserId(this.getUser().id!, 0, 1000).subscribe({
      next: (res) => {
        this.addresses = res.data.content.map((e: Address) => {
          return {
            name: `${e.lastName} ${e.firstName}. ${e.street}, ${e.ward}, ${e.district}, ${e.city}`,
            address: <Address>{ ...e },
          };
        });

        if (this.addresses.length !== 0) {
          this.autoSelectAddressDefault();
        }

        this.isLoading = false;
      },
      error: (res) => {
        this.isLoading = false;
      },
    });
  }
  onChangeAddress(e: any) {
    console.log(e);
    this.isLoading = true;
    let { value } = e;
    this.addressTemp.city = this.provinces.find((e) => e.name === value.address.city)!;
    if (this.addressTemp.city) {
      this.provincesApi
        .getDistricts(this.addressTemp.city.code!)
        .pipe(
          switchMap((province: Province) => {
            this.districts = province.districts!;
            this.addressTemp.district = this.districts.find((e) => e.name === value.address.district)!;
            return this.provincesApi.getCommunes(this.addressTemp.district.code!);
          }),
        )
        .subscribe({
          next: (district: District) => {
            this.wards = district.wards!;
            this.addressTemp.ward = this.wards.find((e) => e.name === value.address.ward)!;
            this.infoForm.patchValue({
              firstName: value.address.firstName,
              lastName: value.address.lastName,
              phoneNum: value.address.phone,
              street: value.address.street,
              province: this.addressTemp.city,
              district: this.addressTemp.district,
              ward: this.addressTemp.ward,
            });
          },
          error: (res) => {
            this.isLoading = false;
          },
        });
    }

    this.isLoading = false;
  }
  renderPaypal() {
    console.log(this.totalCart / 25000);
    render({
      id: '#myPaypalButton',
      currency: 'USD',
      value: '' + ~~(this.totalCart / 25000),
      // value: '' + ~~10.94904,
      onApprove: (details) => {
        console.log(~~(this.totalCart / 25));
        this.payer = details.payer.name.given_name + ' ' + details.payer.name.surname;
        this.emailPayer = details.payer.email_address;
        this.statusPayment = EStatusPayment.PAID;
        this.paymentMethod = PaymentMethod.PAYPAL;
        this.payInAdvace = true;
        this.onSubmit();
      },
    });
  }
  onChangeProvince(e: any) {
    this.provincesApi.getDistricts(e.value.code).subscribe({
      next: (province: Province) => {
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
    console.log(this.payer, this.paymentMethod, this.statusPayment);
    this.isLoadingComponent = true;
    const valueForm = this.infoForm.value;
    let orderDetails: OrderDetail[] = this.cartItems.map((item) => {
      return {
        price: item.product.price,
        quantity: item.quantity,
        discount: item.product.discount || 0,
        productId: item.product.id,
      };
    });
    let checkout: Checkout = {
      description: this.infoForm.value.notes,
      shippingCost: this.shippingCost,
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
      address: `${valueForm.street}, ${valueForm.ward.name}, ${valueForm.district.name}, ${valueForm.province.name}`,
      orderDetails: orderDetails,
      phone: this.infoForm.value.phoneNum,
      fullName: this.infoForm.value.lastName + ' ' + this.infoForm.value.firstName,
      payment: {
        email: this.emailPayer || '',
        payer: this.payer || this.getUser().name,
        paymentMethod: this.payInAdvace ? this.paymentMethod : PaymentMethod.COD,
        status: this.payInAdvace ? this.statusPayment : EStatusPayment.UNPAID,
      },
    };
    console.log(checkout);
    if (!this.paymentMethod) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to order?',
        accept: () => {
          this.orderService
            .checkout(checkout)
            .pipe(switchMap((_) => this.cartItemService.deleteByUserId(this.getUser().id!)))
            .subscribe({
              next: (res: any) => {
                this.isLoadingComponent = false;
                this.shareMessageService.message.next('Ordered successfully. The store staff will contact you to confirm your order.');
                this.router.navigate(['/account/order']);
              },
              error: (res) => {
                this.isLoadingComponent = false;
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: res.error.message,
                });
              },
            });
        },
        reject: (type: any) => {
          this.isLoadingComponent = false;
        },
      });
    } else {
      this.orderService
        .checkout(checkout)
        .pipe(switchMap((_) => this.cartItemService.deleteByUserId(this.getUser().id!)))
        .subscribe({
          next: (res: any) => {
            this.isLoadingComponent = false;
            this.shareMessageService.message.next('Checkout successfully. The store staff will contact you to confirm your order ');

            this.router.navigate(['/account/order']);
          },
          error: (res) => {
            console.log(res);
            this.isLoadingComponent = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res.error.message,
            });
          },
        });
    }
  }
  onCheckVoucher() {
    this.isLoading = true;
    if (this.voucherInput.length > 20) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Service Message',
        detail: 'Code is wrong',
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
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNum: ['', [Validators.required, Validators.pattern(phoneNum)]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      province: [null, Validators.required],
      district: [null, Validators.required],
      ward: [null, Validators.required],
      notes: [''],
      address: [null],
    });
  }
  get firstName() {
    return this.infoForm.get('firstName');
  }
  get lastName() {
    return this.infoForm.get('lastName');
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
  get address() {
    return this.infoForm.get('address');
  }
  get ward() {
    return this.infoForm.get('ward');
  }
  get district() {
    return this.infoForm.get('district');
  }

  loadTotal() {
    this.totalQuantity = this.cartItems.reduce((total, current) => {
      return total + current.quantity;
    }, 0);
    this.totalCart = this.cartItems.reduce((total, current) => {
      return total + this.calcPriceDiscount(current.product.price, current.product.discount) * current.quantity;
    }, 0);
  }
  calcPriceDiscount(price: number, discount: number = 0): number {
    return price - (price * discount) / 100;
  }
  goHome() {
    this.router.navigate(['/']);
  }
  ngOnDestroy(): void {
    if (this.cartItemsChange) {
      this.cartItemsChange.unsubscribe();
    }
  }
}
