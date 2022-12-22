import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs';

//model
import { Category } from 'src/app/model/category.model';
import { Paginator } from 'src/app/model/paginator.model';
import * as slug from 'vietnamese-slug';

//primeNg
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';

//component
import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { HighlighterPipe } from './../../pipes/highlighter.pipe';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    MessageModule,
    DialogModule,
    InputTextModule,
    MyCurrency,
    HighlighterPipe,
    TableModule,
    PaginatorModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.scss'],
})
export class CategoryManagerComponent implements OnInit {
  titleComponent: string;
  categories: Category[] = [];
  isLoadingTable = false;
  isLoading = false;
  submitted = false;
  cateogryDialog = false;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  category: Category;
  statusSelected!: { label?: string; value?: number };

  listStatuses = [
    { label: 'ACTIVE', value: 1 },
    { label: 'INACTIVE', value: 0 },
  ];
  constructor(
    private categoryManagerService: CategoryManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.changeParams();
  }
  getCategories() {
    this.categoryManagerService
      .getAll(this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(300))
      .subscribe({
        next: (res) => {
          this.categories = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
          console.log(this.paginator.totalElements);
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  openNew() {
    this.submitted = false;
    this.cateogryDialog = true;
    this.resetValueForm();
  }
  resetValueForm() {
    this.category = {};
    this.statusSelected = { label: 'ACTIVE', value: 1 };
  }
  hideDialog() {
    this.cateogryDialog = false;
    this.submitted = false;
    this.resetValueForm();
  }
  saveCategory() {
    this.submitted = true;
    if (!this.isValid()) return;
    this.category.status = this.statusSelected.value;
    this.category.slug = slug(this.category.name);

    console.log(this.category);
    this.categoryManagerService.add(this.category).subscribe({
      next: (res) => {
        console.log(res);
        this.hideDialog();
        this.submitted = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Added category successfully!',
          life: 2000,
        });
        this.getCategories();
      },
      error: (res) => {
        this.submitted = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.error.message,
          life: 3000,
        });
      },
    });
  }
  editCategory(category: Category) {
    this.cateogryDialog = true;
    this.category = this.pick(category, 'id', 'name', 'slug', 'status');
    this.statusSelected = { label: this.category.status ? 'ACTIVE' : 'INACTIVE', value: this.category.status! };
  }
  pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    const copy = {} as Pick<T, K>;
    keys.forEach((key) => (copy[key] = obj[key]));
    return copy;
  }
  remove(category: Category) {
    this.confirmationService.confirm({
      message: 'Do you want to INACTIVE this category?',
      header: 'Update Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        let categoryDelete = this.pick(category, 'id', 'name', 'status', 'slug');
        categoryDelete.status = 0;

        this.categoryManagerService.add(categoryDelete).subscribe({
          next: (res) => {
            category.status = 0;
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
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;
      this.getCategories();
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
    console.log('Add params');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.paramsURL,
    });
  }
  isValid(): boolean {
    if (!this.category.name || !this.statusSelected.label) {
      return false;
    }
    return true;
  }
}
