import { RouterModule } from '@angular/router';
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
  submitted = false;
  constructor(
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private addressService: AddressService,
    private userInforService: UserInforService,
    private provincesApi: ProvincesApiService
  ) {}

  ngOnInit(): void {
    this.getAddresses();
    this.getProvinces();
  }
  getAddresses() {
    this.addressService.getByUserId(this.userInforService.user!.id!).subscribe({
      next: (res) => {
        this.addresses = res.data.content;
      },
      error: (res) => {},
    });
  }
  logout() {
    this.tokenStorageService.signOut();
  }
  openNew() {
    this.address = {};
    this.submitted = false;
    this.addressDialog = true;
  }
  deleteSelectedAddresses() {}
  editAddress(address: any) {}
  deleteAddress(address: any) {}
  hideDialog() {}
  saveAddress() {
    this.submitted = true;
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  getProvinces() {
    this.provincesApi.getProvinces().subscribe({
      next: (provinces: Province[]) => {
        this.provinces = provinces;
        console.log(this.provinces);
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
}
