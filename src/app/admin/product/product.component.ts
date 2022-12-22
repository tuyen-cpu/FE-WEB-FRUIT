import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { BehaviorSubject, debounceTime, delay, distinctUntilChanged, of, Subject } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

//component
import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import ProductManagerService from 'src/app/services/admin/product-manager.service';
import { ImageService } from './../../services/image.service';
import { FileUploadService } from './../../services/file-upload.service';
import { HighlighterPipe } from 'src/app/pipes/highlighter.pipe';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import { LoadingComponent } from 'src/app/utils/loading/loading.component';

//model
import { ProductFilter } from 'src/app/model/filter.model';
import { Category, Image, Product, ProductRequest } from 'src/app/model/category.model';
import { Paginator } from 'src/app/model/paginator.model';

//primeNg
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { CalendarModule } from 'primeng/calendar';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import * as customBuild from '../../../ckeditorCustom/build/ckeditor';
import * as slug from 'vietnamese-slug';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    HighlighterPipe,
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
    InputNumberModule,
    CKEditorModule,
    FileUploadModule,
    ImageModule,
    MyCurrency,
    CalendarModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductComponent implements OnInit, OnDestroy {
  @ViewChild('fileUpload') fileUpload!: any;
  @ViewChild('dt') dt!: Table;
  titleComponent!: string;
  urlImage!: string;
  products: Product[] = [];
  isLoading: boolean = false;
  isLoadingTable: boolean = false;
  submitted: boolean = false;
  productDialog: boolean = false;
  listRoles: any;
  listStatuses: any;
  cols: any;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  paramsURL: {} = {};
  product!: ProductRequest;
  images: Image[] = [];
  statusSelected!: { label?: string; value?: number };
  selectedProduct!: any[];
  categories: Category[] = [];
  categorySelected!: Category;
  uploadedFiles: any[] = [];
  formDataImage!: FormData;
  public Editor = customBuild;
  dataEditor!: string;
  statusFilterSelected: { label?: string; value?: number };
  filter: ProductFilter = { page: 0, size: 10 };
  datesFilter: Date[] = [];
  categoryFilterSelected: Category;
  private subjectKeyup = new Subject<any>();
  flagFilter = false;
  config = {
    toolbar: {
      items: ['heading', '|', 'bold', 'italic', 'link', 'insertTable', 'alignment', 'bulletedList', 'numberedList', 'blockQuote', 'uploadImage'],
      shouldNotGroupWhenFull: true,
    },
    alignment: {
      options: ['left', 'center', 'justify', 'right'],
    },
    image: {
      style: ['alignLeft', 'alignCenter', 'alignRight'],
      resizeUnit: '%',
      resizeOptions: [
        {
          name: 'imageResize:original',
          value: null,
          icon: 'original',
        },
        {
          name: 'imageResize:10',
          value: '10',
          icon: 'medium',
        },
        {
          name: 'imageResize:50',
          value: '50',
          icon: 'medium',
        },
        {
          name: 'imageResize:75',
          value: '75',
          icon: 'large',
        },
      ],
      toolbar: [
        'imageResize',
        'imageResize:10',
        'imageResize:original',
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        'imageStyle:alignLeft',
        'imageStyle:alignRight',
        'imageStyle:alignCenter',
        '|',
        '|',
        'imageTextAlternative',
      ],
    },
  };
  constructor(
    private productManagerService: ProductManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoryManagerService: CategoryManagerService,
    private fileUploadService: FileUploadService,
    private imageService: ImageService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.listStatuses = [
      { label: 'ACTIVE', value: 1 },
      { label: 'INACTIVE', value: 0 },
    ];
    this.titleComponent = this.route.snapshot.data['title'];
    this.urlImage = this.fileUploadService.getLink();

    // this.filterUserKeyup();
    this.changeParams();
    this.initTable();
    this.getCategories();
  }
  clearFilterName() {
    this.filter.name = undefined;
    this.checkAllWithoutFilter();
  }
  onChangeStatusFilter() {
    this.filter.status = this.statusFilterSelected ? this.statusFilterSelected.value : undefined;
    this.checkAllWithoutFilter();
  }
  onChangeCategoryFilter() {
    this.filter.categoryId = this.categoryFilterSelected ? this.categoryFilterSelected.id : undefined;
    this.checkAllWithoutFilter();
  }
  onFilterUser() {
    this.resetFilterPaginator();
    this.resetPaginator();
    this.filterProduct();
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
  resetFilterPaginator() {
    this.filter.page = 0;
    this.filter.size = 10;
  }
  onSelectDateFilter() {
    this.filter.createdAt = this.convertDateToString(this.datesFilter);
  }
  convertDateToString(dates: Date[]): string[] {
    return dates.map((date) => this.datePipe.transform(date, 'yyyy-MM-dd'));
  }
  onClearDate() {
    this.filter.createdAt = undefined;
    this.checkAllWithoutFilter();
  }
  hasValueFilter() {
    return this.statusFilterSelected || this.categoryFilterSelected || this.filter.name || (this.datesFilter && this.datesFilter.length);
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
        this.getProduct();
      }
    }
  }

  clearFilter() {
    this.filter = { page: 0, size: 10 };
    this.statusFilterSelected = undefined;
    this.getProduct();
  }

  filterProduct() {
    this.flagFilter = true;
    this.isLoadingTable = true;
    this.filter.page = this.paginator.pageNumber;
    this.filter.size = this.paginator.pageSize;
    this.productManagerService
      .filter(this.filter)
      .pipe(delay(500))
      .subscribe({
        next: (res: any) => {
          this.products = res.data.content;
          this.paginator.totalElements = res.data.totalElements;
          this.isLoadingTable = false;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  // filterUserKeyup() {
  //   this.subjectKeyup.pipe(distinctUntilChanged(), debounceTime(800)).subscribe((key) => {
  //     this.filterProduct();
  //   });
  // }

  onReady(editor: any) {
    if (editor.model.schema.isRegistered('image')) {
      editor.model.schema.extend('image', { allowAttributes: 'blockIndent' });
    }
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;
      // if (this.filter.name || this.filter.price || this.filter.discount || this.filter.quantity || this.filter.status !== undefined) {
      //   this.filter.page = this.paginator.pageNumber;
      //   this.filter.size = Number(res['size']);
      //   this.filterUser();
      //   return;
      // }
      if (this.hasValueFilter()) {
        // this.filter.page = this.paginator.pageNumber;
        // this.filter.size = this.paginator.pageSize;
        this.filterProduct();
        return;
      }
      this.getProduct();
    });
  }
  getProduct() {
    this.flagFilter = false;
    this.isLoadingTable = true;
    this.productManagerService
      .getProductByCategoryIdAndPriceLessThan(0, 9999999999, this.paginator.pageNumber, this.paginator.pageSize)
      .pipe(delay(300))
      .subscribe({
        next: (res) => {
          this.products = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
          console.log(this.paginator.totalElements);
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
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
    this.submitted = false;
    this.productDialog = true;
    this.resetValueForm();
  }
  resetValueForm() {
    this.product = {};
    this.categorySelected = {};
    this.statusSelected = { label: 'ACTIVE', value: 1 };
    this.images = [];
    this.dataEditor = '<p>Enter description here!</p>';
  }
  saveProduct() {
    this.submitted = true;

    if (!this.isValid()) return;
    this.formDataImage = new FormData();
    for (let file of this.fileUpload._files) {
      this.formDataImage.append('file', file);
    }

    this.product.category = this.categorySelected;
    this.product.status = this.statusSelected.value;
    this.product.description = this.dataEditor;
    this.product.slug = slug(this.product.name);
    this.formDataImage.append('product', JSON.stringify(this.product));
    this.productManagerService.add(this.formDataImage).subscribe({
      next: (res) => {
        this.hideDialog();
        this.submitted = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Added product successfully!',
          life: 2000,
        });
        if (this.hasValueFilter()) {
          this.filterProduct();
        } else {
          this.getProduct();
        }
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
  remove(product: Product) {
    this.confirmationService.confirm({
      message: 'Do you want to INACTIVE this product?',
      header: 'Update Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.formDataImage = new FormData();

        let productDelete = this.pick(product, 'id', 'name', 'category', 'quantity', 'price', 'status', 'discount', 'description');
        productDelete.status = 0;
        this.formDataImage.append('product', JSON.stringify(productDelete));
        this.productManagerService.add(this.formDataImage).subscribe({
          next: (res) => {
            product.status = 0;
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
      //        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      //       break;
      //     case ConfirmEventType.CANCEL:
      //       this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
      //       break;
      //   }
      // },
    });
  }
  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
    this.resetValueForm();
  }
  resetView() {
    this.isLoadingTable = true;
    this.getProduct();
    this.isLoadingTable = false;
  }
  pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
    const copy = {} as Pick<T, K>;
    keys.forEach((key) => (copy[key] = obj[key]));
    return copy;
  }
  editProduct(product: Product) {
    this.isLoadingTable = true;
    this.imageService
      .getAllByProductId(product.id)
      .pipe(delay(10))
      .subscribe({
        next: (res) => {
          this.images = res.data;
          this.productDialog = true;

          this.product = this.pick(product, 'id', 'name', 'category', 'quantity', 'price', 'status', 'discount', 'description');

          this.dataEditor = product.description!;
          this.statusSelected = { label: this.product.status ? 'ACTIVE' : 'INACTIVE', value: this.product.status! };
          this.categorySelected = {
            name: product.category!.name,
            id: product.category?.id,
            status: product.category?.status,
            slug: product.category.slug,
          };

          this.isLoadingTable = false;
        },
        error: (res) => {
          this.isLoadingTable = false;
          this.hideDialog();
        },
      });
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
      { label: 'ACTIVE', value: 1 },
      { label: 'INACTIVE', value: 0 },
    ];
  }
  getCategories() {
    this.categoryManagerService.getAll(0, 10).subscribe({
      next: (res) => {
        this.categories = res.data.content;
      },
    });
  }
  onUpload(event: any) {
    console.log(event.files, this.fileUpload._files);
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.formDataImage = new FormData();
    for (let file of event.files) {
      this.formDataImage.append('file', file);
    }
    console.log(this.formDataImage);
  }
  isValid(): boolean {
    if (!this.product.name || !this.product.price || !this.product.quantity || !this.statusSelected.label || !this.categorySelected) {
      return false;
    }
    return true;
  }
  trackById(index: number, item: any) {
    return item.id;
  }
  ngOnDestroy() {
    if (this.subjectKeyup) {
      this.subjectKeyup.unsubscribe();
    }
  }
}
