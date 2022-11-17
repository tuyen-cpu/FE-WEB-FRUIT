import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserInforService } from 'src/app/services/user-infor.service';
import { AddressService } from './../../../services/address.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';

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
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddressComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  selectedAddresses: any[] = [];
  addresses: Address[] = [];
  addressDialog = false;
  address: Address = {};
  isDefault = false;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];

  addressesChange = new BehaviorSubject<Address[]>([]);
  addressSubscription!: Subscription;

  city!: Province;
  district!: District;
  ward!: Ward;
  isLoading: boolean = false;
  submitted = false;
  phonePattern: string | RegExp = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  constructor(
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private addressService: AddressService,
    private userInforService: UserInforService,
    private provincesApi: ProvincesApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAddresses();
    this.getProvinces();
    this.addressSubscription = this.addressesChange.subscribe((data) => {
      this.addresses = data;
    });
  }
  getAddresses() {
    this.isLoading = true;
    console.log(this.isLoading);
    this.addressService.getByUserId(this.getUserId(), 0, 50).subscribe({
      next: (res) => {
        this.addresses = res.data.content;
        this.addressesChange.next(this.addresses);
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
  deleteSelectedAddresses() {}
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
            this.district = this.districts.find(
              (e) => e.name === address.district
            )!;
            console.log(this.district);
            return this.provincesApi.getCommunes(this.district.code!);
          })
        )
        .subscribe({
          next: (district: District) => {
            this.wards = district.wards!;
            this.ward = this.wards.find((e) => e.name === address.ward)!;
            console.log(this.ward);
            this.isLoading = false;
            this.addressDialog = true;
          },
          error: (res) => {
            this.isLoading = false;
          },
        });
    }

    this.address = { ...address };
  }
  deleteAddress(address: any) {}
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
          this.addresses.push(res.data);
          this.addressesChange.next(this.addresses);
          this.isLoading = false;
          this.addressDialog = false;
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
        this.addresses.push(res.data);
        this.addressesChange.next(this.addresses);
        this.isLoading = false;
        this.addressDialog = false;
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
  isEmpty(obj: Object) {
    return Object.keys(obj).length === 0;
  }
  // changeParams() {
  //   this.route.queryParams.subscribe((res) => {
  //     console.log('change param');
  //     if (res['page'] === undefined || res['page'] === null) {
  //       this.paginator.pageNumber = 0;
  //     } else {
  //       this.paginator.pageNumber = res['page'] - 1;
  //     }
  //     this.paginator.pageSize = Number(res['size']) || 12;

  //     this.getAddresses();
  //   });
  // }
  // onPageChange(event: any) {
  //   this.paginator.pageNumber = event.page;
  //   this.paramsURL = {
  //     page: this.paginator.pageNumber + 1,
  //     size: this.paginator.pageSize,
  //   };
  //   this.addParams();
  // }
  // addParams() {
  //   console.log(this.route);
  //   this.router.navigate([], {
  //     relativeTo: this.route,
  //     queryParams: this.paramsURL,
  //   });
  // }
}
