import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProvincesApiService } from 'src/app/services/provinces-api.service';
import { CheckboxModule } from 'primeng/checkbox';
import { Paginator } from 'src/app/model/paginator.model';
import { PaginatorModule } from 'primeng/paginator';
import { LoadingComponent } from 'src/app/utils/loading/loading.component';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User } from 'src/app/model/user.model';
import { UserService } from 'src/app/services/user.service';
import { MultiSelectModule } from 'primeng/multiselect';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { delay } from 'rxjs';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    InputTextModule,
    PaginatorModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    MessageModule,
    DialogModule,
    MultiSelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  titleComponent!: string;
  isLoading: boolean = false;
  isLoadingTable: boolean = false;
  submitted: boolean = false;
  userDialog: boolean = false;
  listRoles: any;
  listStatuses: any;
  cols: any;
  users: User[] = [];
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 5 };
  paramsURL: {} = {};
  user!: User;
  emailPattern: RegExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  firstName!: string;
  lastName!: string;
  email!: string;
  role!: string[];
  status!: number;
  rolesSelected!: { label?: string; value?: string }[];
  statusSelected!: { label?: string; value?: number };
  constructor(
    private userService: UserService,
    private userManagerService: UserManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.initTable();
    this.changeParams();
  }
  getUsers() {
    this.isLoadingTable = true;
    this.userService
      .getAll(this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(100))
      .subscribe({
        next: (res: any) => {
          this.users = res.data.content;
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
      console.log('change param');
      if (res['page'] === undefined || res['page'] === null) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 5;

      this.getUsers();
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
  openNew() {
    this.resetValueForm();
    this.submitted = false;
    this.userDialog = true;
  }
  resetValueForm() {
    this.user = {};
    this.statusSelected = { label: 'ACTIVE', value: 1 };
    this.rolesSelected = [];
  }
  saveUser() {
    this.submitted = true;
    if (!this.isValid()) return;

    this.user.status = this.statusSelected.value;
    this.user.roles = this.rolesSelected.map((role) => role.value);
    this.userManagerService.add(this.user).subscribe({
      next: (res) => {
        console.log(res);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Added!',
          life: 2000,
        });
        this.getUsers();
        this.hideDialog();
      },
      error: (res) => {
        console.log(res.status);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.error.message,
          life: 2000,
        });
      },
    });
    return;
    // }
  }
  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
    this.resetValueForm();
  }
  resetView() {}
  editUser(user: User) {
    console.log(user);
    this.userDialog = true;
    this.user = { ...user };
    this.rolesSelected = user.roles.map((e) => ({ label: e, value: e }));
    this.statusSelected = { label: user.status ? 'ACTIVE' : 'INACTIVE', value: user.status! };
    console.log(this.statusSelected);
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  isValid(): boolean {
    if (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      !this.rolesSelected.length ||
      !this.statusSelected.label ||
      !this.emailPattern.test(this.user.email)
    ) {
      return false;
    }
    return true;
  }
  initTable() {
    this.listRoles = [
      { label: 'admin', value: 'admin' },
      { label: 'client', value: 'client' },
      { label: 'manager', value: 'manager' },
    ];
    this.listStatuses = [
      { label: 'ACTIVE', value: 1 },
      { label: 'INACTIVE', value: 0 },
    ];
  }
}
