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
  submitted: boolean = false;
  userDialog: boolean = false;
  listRoles: any;
  listStatuses: any;
  cols: any;
  users: User[] = [];
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 5 };
  paramsURL: {} = {};
  user!: User;

  firstName!: string;
  lastName!: string;
  email!: string;
  role!: string[];
  status!: number;
  selectedRoles!: any[];
  constructor(
    private userService: UserService,
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
    this.userService.getAll(this.paginator.pageNumber, this.paginator.pageSize).subscribe({
      next: (res: any) => {
        this.users = res.data.content;
      },
      error: (res) => {},
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
    this.paramsURL = {
      page: this.paginator.pageNumber + 1,
      size: this.paginator.pageSize,
    };
    this.addParams();
  }
  addParams() {
    console.log(this.route);
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
  resetValueForm() {}
  saveAddress() {
    this.submitted = true;
    if (this.user.id) {
      this.userService.update(this.user).subscribe({
        next: (res) => {
          console.log(res);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Updated',
            life: 1000,
          });
          this.getUsers();
        },
        error: (res) => {},
      });
      return;
    }
  }
  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }
  resetView() {}
  editUser(user: User) {
    this.userDialog = true;
    this.user = { ...user };
  }
  applyFilterGlobal($event: any, stringVal: any) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  initTable() {
    this.listRoles = [
      { label: 'Admin', value: 'admin' },
      { label: 'Client', value: 'client' },
      { label: 'Manager', value: 'manager' },
    ];
    this.listStatuses = [
      { label: 'ACTIVE', value: '1' },
      { label: 'INACTIVE', value: '0' },
    ];
  }
}
