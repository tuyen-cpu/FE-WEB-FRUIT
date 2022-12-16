import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { delay, Subject, Subscription, BehaviorSubject, debounceTime } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
//component
import { UserService } from 'src/app/services/user.service';
import { UserInforService } from './../../services/user-infor.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';
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
import { CalendarModule } from 'primeng/calendar';

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
    CalendarModule,
    DropdownModule,
    InputTextModule,
    PaginatorModule,
    MultiSelectModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
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
  datesFilter: Date[] = [];
  private subjectKeyup = new Subject<any>();
  emailPattern: RegExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  flagFilter = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userInforService: UserInforService,
    private userService: UserService,
    private userManagerService: UserManagerService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.currentUser = this.userInforService.user;
    this.initTable();
    this.changeParams();
  }
  getUsers() {
    this.flagFilter = false;
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
  resetFilterPaginator() {
    this.filter.page = 0;
    this.filter.size = 10;
  }
  resetPaginator() {
    this.paginator.pageNumber = 0;
    this.paginator.pageSize = 10;
    this.paramsURL = {
      page: this.paginator.pageNumber + 1,
      size: this.paginator.pageSize,
    };

    this.addParams();
  }
  onChangeRoleFilter() {
    this.filter.role = this.roleFilterSelected ? this.roleFilterSelected.label : undefined;
    this.checkAllWithoutFilter();
  }
  onChangeStatusFilter() {
    this.filter.status = this.statusFilterSelected ? this.statusFilterSelected.value : undefined;
    this.checkAllWithoutFilter();
  }
  clearFilterEmail() {
    this.filter.email = undefined;
    this.checkAllWithoutFilter();
  }

  onSelectDateFilter() {
    this.filter.createdAt = this.convertDateToString(this.datesFilter);
  }
  onFilter(event: any) {
    console.log(this.filter.createdAt);
  }
  onClearDate() {
    this.filter.createdAt = undefined;
    this.checkAllWithoutFilter();
  }
  hasValueFilter() {
    return this.statusFilterSelected || this.roleFilterSelected || this.filter.email || (this.datesFilter && this.datesFilter.length);
  }

  checkAllWithoutFilter() {
    if (!this.hasValueFilter()) {
      this.paginator.pageNumber = 0;
      this.paginator.pageSize = 10;
      this.paramsURL = {
        page: this.paginator.pageNumber + 1,
        size: this.paginator.pageSize,
      };

      this.addParams();
      if (this.flagFilter) {
        this.getUsers();
      }
    }
  }
  onFilterUser() {
    this.resetFilterPaginator();
    this.resetPaginator();
    this.filterUser();
  }
  filterUser() {
    this.filter.page = this.paginator.pageNumber;
    this.filter.size = this.paginator.pageSize;
    this.flagFilter = true;
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

  convertDateToString(dates: Date[]): string[] {
    return dates.map((date) => this.datePipe.transform(date, 'yyyy-MM-dd'));
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
        this.goLastPage();
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
  goLastPage() {
    this.paginator.pageNumber = this.calculatePagesCount(this.paginator.pageSize, this.paginator.totalElements);
  }
  calculatePagesCount = (pageSize, totalCount) => {
    // we suppose that if we have 0 items we want 1 empty page
    return totalCount < pageSize ? 1 : Math.ceil(totalCount / pageSize);
  };
  remove(user: User) {
    this.confirmationService.confirm({
      message: 'Do you want to INACTIVE this user?',
      header: 'Update Confirmation',
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
      // reject: (type) => {
      //   switch (type) {
      //     case ConfirmEventType.REJECT:
      //       this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      //       break;
      //     case ConfirmEventType.CANCEL:
      //       this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
      //       break;
      //   }
      // },
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
      this.paginator.pageSize = Number(res['size']) || 10;
      if (this.hasValueFilter()) {
        this.filterUser();
        return;
      }
      console.log('change para');
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
