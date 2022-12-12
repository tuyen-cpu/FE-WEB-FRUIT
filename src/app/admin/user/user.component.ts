import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay, Subject, Subscription, BehaviorSubject, debounceTime } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
//component
import { UserService } from 'src/app/services/user.service';
import { UserInforService } from './../../services/user-infor.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';

//model
import { User } from 'src/app/model/user.model';
import { UserFilter } from 'src/app/model/filter.model';
import { Paginator } from 'src/app/model/paginator.model';

//primeNg

import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, ConfirmEventType, FilterMatchMode, MessageService, SelectItem } from 'primeng/api';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    HighlighterPipe,
    TableModule,
    ToastModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    MessageModule,
    ToolbarModule,
    DropdownModule,
    InputTextModule,
    PaginatorModule,
    MultiSelectModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserComponent implements OnInit, OnDestroy {
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
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  user!: User;
  firstName!: string;
  lastName!: string;
  email!: string;
  role!: string[];
  status!: number;
  // rolesSelected!: { label?: string; value?: string }[];
  roleSelected: { label?: string; value?: string };
  statusSelected!: { label?: string; value?: number };
  currentUser: User;
  matchModeOptions: SelectItem[];
  filter: UserFilter = { page: 0, size: 10 };
  roleFilterSelected: { label?: string; value?: string };
  statusFilterSelected: { label?: string; value?: number };
  private subjectKeyup = new Subject<any>();
  emailPattern: RegExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userInforService: UserInforService,
    private userService: UserService,
    private userManagerService: UserManagerService,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.currentUser = this.userInforService.user;
    this.initTable();
    this.changeParams();
    this.filterUserKeyup();
  }
  getUsers() {
    this.isLoadingTable = true;
    this.userManagerService
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

  onFilter(event) {
    console.log(this.roleFilterSelected);
    console.log(this.isEmptyFilter());
    if (this.isEmptyFilter()) {
      this.getUsers();
      return;
    }

    this.roleFilterSelected && this.roleFilterSelected.label ? (this.filter.role_name = this.roleFilterSelected.value) : (this.filter.role_name = '');
    this.statusFilterSelected && this.statusFilterSelected.label
      ? (this.filter.status = this.statusFilterSelected.value)
      : (this.filter.status = undefined);

    // if (!this.filter.email && !this.filter.firstName && !this.filter.lastName && !this.filter.role_name) {
    //   return;
    // }
    this.subjectKeyup.next(this.filter);
  }
  clearFilter() {
    this.filter = { page: 0, size: 10 };
    this.roleFilterSelected = undefined;
    this.statusFilterSelected = undefined;
    this.getUsers();
  }
  isEmptyFilter(): boolean {
    return !this.filter.email && !this.filter.firstName && !this.filter.lastName && !this.roleFilterSelected && !this.statusFilterSelected;
  }
  filterUser() {
    this.isLoadingTable = true;
    this.userManagerService
      .filter(this.filter)
      .pipe(delay(500))
      .subscribe({
        next: (res: any) => {
          this.users = res.data.content;
          this.paginator.totalElements = res.data.totalElements;
          console.log(res.data);
          this.isLoadingTable = false;
        },
        error: (res) => {
          console.log(res);
          this.isLoadingTable = false;
        },
      });
  }
  filterUserKeyup() {
    this.subjectKeyup.pipe(debounceTime(800)).subscribe((key) => {
      this.filterUser();
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
    // this.rolesSelected = [];
    this.roleSelected = { label: 'client', value: 'client' };
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
    // this.rolesSelected = user.roles.map((e) => ({ label: e, value: e }));
    this.roleSelected = { label: user.roles[0], value: user.roles[0] };
    this.statusSelected = { label: user.status ? 'ACTIVE' : 'INACTIVE', value: user.status! };
  }
  saveUser() {
    this.submitted = true;
    if (!this.isValid()) return;
    this.user.status = this.statusSelected.value;
    // this.user.roles = this.rolesSelected.map((role) => role.value);
    this.user.roles = [...[], this.roleSelected.value];
    if (this.user.id) {
      this.userManagerService.edit(this.user).subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: res.message,
            life: 2000,
          });
          this.getUsers();
          this.hideDialog();
        },
        error: (res) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.error.message,
            life: 2000,
          });
        },
      });
      return;
    }
    this.userManagerService.add(this.user).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: res.message,
          life: 2000,
        });
        this.getUsers();
        this.hideDialog();
      },
      error: (res) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.error.message,
          life: 2000,
        });
      },
    });
    // }
  }
  remove(user: User) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this user?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        const userDelete = { ...user };
        userDelete.status = 0;
        this.userManagerService.edit(userDelete).subscribe({
          next: (res) => {
            user.status = 0;
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: 'Record deleted' });
          },
          error: (res) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error.message });
          },
        });
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            break;
        }
      },
    });
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  isValid(): boolean {
    if (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      // !this.rolesSelected.length ||
      !this.roleSelected.value ||
      !this.statusSelected.label ||
      !this.emailPattern.test(this.user.email)
    ) {
      return false;
    }
    return true;
  }
  initTable() {
    if (this.includesRole(this.currentUser, 'admin')) {
      this.listRoles = [
        { label: 'client', value: 'client' },
        { label: 'manager', value: 'manager' },
        { label: 'admin', value: 'admin' },
      ];
    } else {
      this.listRoles = [
        { label: 'client', value: 'client' },
        { label: 'manager', value: 'manager' },
      ];
    }

    this.listStatuses = [
      { label: 'ACTIVE', value: 1 },
      { label: 'INACTIVE', value: 0 },
    ];
  }
  includesRole(user: User, role: string): boolean {
    return user.roles.includes(role);
  }

  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 5;

      if (this.filter.email || this.filter.firstName || this.filter.lastName || this.filter.role_name || this.filter.status !== undefined) {
        console.log(this.filter);
        console.log('vao dy');
        this.filter.page = res['page'] - 1;
        this.filter.size = Number(res['size']);
        console.log(this.filter);
        this.filterUser();
        return;
      }
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
  ngOnDestroy() {
    if (this.subjectKeyup) {
      this.subjectKeyup.unsubscribe();
    }
  }
}
