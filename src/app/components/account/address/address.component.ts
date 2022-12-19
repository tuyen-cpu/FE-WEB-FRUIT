import { BehaviorSubject, debounceTime, delay, fromEvent, isEmpty, of, Subscription, switchMap, timeout } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserInforService } from 'src/app/services/user-infor.service';
import { AddressService } from './../../../services/address.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { Address } from 'src/app/model/address.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { District, Province, Ward } from 'src/app/model/province.model';
import { ProvincesApiService } from 'src/app/services/provinces-api.service';
import { CheckboxModule } from 'primeng/checkbox';
import { Paginator } from 'src/app/model/paginator.model';
import { PaginatorModule } from 'primeng/paginator';
import { LoadingComponent } from 'src/app/utils/loading/loading.component';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    RadioButtonModule,
    DropdownModule,
    FormsModule,
    DialogModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    RouterModule,
    CheckboxModule,
    ReactiveFormsModule,
    PaginatorModule,
    LoadingComponent,
    RouterModule,
    MessageModule,
    MessagesModule,
    ConfirmDialogModule,
    TooltipModule,
    TranslateModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddressComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dt') dt!: Table;
  selectedAddresses: any[] = [];
  addresses: Address[] = [];
  addressDialog = false;
  address: Address = {};
  isDefault = false;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];

  // addressesChange = new BehaviorSubject<Address[]>([]);
  // addressSubscription!: Subscription;

  city!: Province;
  district!: District;
  ward!: Ward;
  isLoading: boolean = false;
  submitted = false;
  phonePattern: string | RegExp = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  first = 0;
  row = 10;
  constructor(
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private addressService: AddressService,
    private userInforService: UserInforService,
    private provincesApi: ProvincesApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // this.isLoading = true;
    this.changeParams();
    this.getProvinces();
    // this.addressSubscription = this.addressesChange.subscribe((data) => {
    //   this.addresses = data;
    // });
  }
  ngAfterViewInit(): void {
    // this.isLoading = false;
  }
  getAddresses() {
    this.isLoading = true;
    console.log(this.isLoading);
    this.addressService
      .getByUserId(this.getUserId(), this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(200))
      .subscribe({
        next: (res) => {
          this.addresses = res.data.content;
          // this.addressesChange.next(this.addresses);
          this.paginator.totalElements = res.data.totalElements;
          this.isLoading = false;
        },
        error: (res) => {
          this.isLoading = false;
        },
      });
  }
  logout() {
    this.tokenStorageService.signOut();
  }
  openNew() {
    this.resetValueForm();
    this.submitted = false;
    this.addressDialog = true;
  }
  resetValueForm() {
    this.address = {};
    this.city = {};
    this.district = {};
    this.ward = {};
    this.isDefault = false;
  }
  deleteSelectedAddresses(event: Event) {
    this.addressService.deleteMulti(this.selectedAddresses.map((address) => address.id)).subscribe({
      next: (res) => {
        this.selectedAddresses = [];
        this.getAddresses();
      },
      error: (res) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.error.message,
        });
      },
    });
  }
  editAddress(address: Address) {
    this.isLoading = true;
    this.isDefault = address.isDefault ? true : false;
    this.city = this.provinces.find((e) => e.name === address.city)!;
    if (this.city) {
      this.provincesApi
        .getDistricts(this.city.code!)
        .pipe(
          switchMap((province: Province) => {
            this.districts = province.districts!;
            this.district = this.districts.find((e) => e.name === address.district)!;
            return this.provincesApi.getCommunes(this.district.code!);
          }),
        )
        .subscribe({
          next: (district: District) => {
            this.wards = district.wards!;
            this.ward = this.wards.find((e) => e.name === address.ward)!;

            this.isLoading = false;
            this.addressDialog = true;
            this.getAddresses();
          },
          error: (res) => {
            this.isLoading = false;
          },
        });
    }

    this.address = { ...address };
  }
  deleteAddress(address: Address, event: Event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.addressService.delete(address.id!).subscribe({
          next: (res) => {
            this.getAddresses();

            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: res.message,
            });
          },
          error: (res) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Rejected',
              detail: res.error.message,
            });
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
    this.selectedAddresses = [];
  }
  hideDialog() {
    this.addressDialog = false;
    this.submitted = false;
  }
  saveAddress() {
    console.log(!this.city);
    this.submitted = true;
    this.isLoading = true;
    if (this.invalidForm()) {
      this.isLoading = false;
      return;
    }
    this.address.city = this.city.name;
    this.address.ward = this.ward.name;
    this.address.district = this.district.name;
    this.address.userId = this.getUserId();

    this.address.isDefault = this.isDefault ? 1 : 0;
    console.log(this.address);
    if (this.address.id) {
      this.addressService.update(this.address).subscribe({
        next: (res) => {
          // this.addresses.push(res.data);
          // this.addressesChange.next(this.addresses);
          this.isLoading = false;
          this.addressDialog = false;
          this.getAddresses();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Address Created',
            life: 2000,
          });
        },
        error: (res) => {
          this.isLoading = false;
          this.addressDialog = false;
        },
      });

      return;
    }

    this.addressService.add(this.address).subscribe({
      next: (res) => {
        // this.addresses.push(res.data);
        // this.addressesChange.next(this.addresses);
        this.isLoading = false;
        this.addressDialog = false;
        this.getAddresses();

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Address Created',
          life: 2000,
        });
      },
      error: (res) => {
        this.isLoading = false;
        this.addressDialog = false;
      },
    });
  }
  invalidForm() {
    if (
      !this.address.firstName ||
      !this.address.lastName ||
      !this.city ||
      !this.district ||
      !this.ward ||
      !this.address.street ||
      !this.address.phone
    ) {
      return true;
    }
    return false;
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  getProvinces() {
    this.provincesApi.getProvinces().subscribe({
      next: (provinces: Province[]) => {
        this.provinces = provinces;
      },
    });
  }
  onChangeProvince(code: number) {
    this.provincesApi.getDistricts(code).subscribe({
      next: (province: Province) => {
        this.districts = province.districts!;
      },
    });
  }
  onChangeDistrict(code: number) {
    this.provincesApi.getCommunes(code).subscribe({
      next: (district: District) => {
        this.wards = district.wards!;
      },
    });
  }
  getUserId(): number {
    return this.userInforService.user?.id!;
  }

  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;

      this.getAddresses();
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
    // if (this.addressesChange) {
    //   this.addressesChange.unsubscribe();
    // }
  }
  isEmptyObject(obj: Object): boolean {
    return Object.keys(obj).length === 0;
  }
  resetView() {
    this.isLoading = true;
    setTimeout(() => {
      this.getAddresses();
    }, 500);
  }
}
