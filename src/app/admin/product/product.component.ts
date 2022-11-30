import { FileUploadService } from './../../services/file-upload.service';
import { LoadingComponent } from 'src/app/utils/loading/loading.component';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import ProductManagerService from 'src/app/services/admin/product-manager.service';
import { Category, Product, ProductRequest } from 'src/app/model/category.model';
import { Table, TableModule } from 'primeng/table';
import { Paginator } from 'src/app/model/paginator.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import * as customBuild from '../../../ckeditorCustom/build/ckeditor';
import { FileUploadModule } from 'primeng/fileupload';
import { forkJoin, switchMap } from 'rxjs';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    LoadingComponent,
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
    InputNumberModule,
    CKEditorModule,
    FileUploadModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: any;
  products: Product[] = [];
  @ViewChild('dt') dt!: Table;
  isLoading: boolean = false;
  isLoadingComponent: boolean = false;
  submitted: boolean = false;
  productDialog: boolean = false;
  listRoles: any;
  listStatuses: any;
  cols: any;
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 5 };
  paramsURL: {} = {};
  product!: ProductRequest;
  statusSelected!: { label?: string; value?: number };
  selectedProduct!: any[];
  categories: Category[] = [];
  categorySelected!: Category;
  uploadedFiles: any[] = [];
  formDataImage!: FormData;
  tests: any[] = [];
  public Editor = customBuild;
  dataEditor!: string;
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
  ) {}

  ngOnInit(): void {
    this.changeParams();
    this.initTable();
    this.getCategories();
  }
  onReady(editor: any) {
    if (editor.model.schema.isRegistered('image')) {
      editor.model.schema.extend('image', { allowAttributes: 'blockIndent' });
    }
  }
  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;

      this.getProduct();
    });
  }
  getProduct() {
    this.isLoadingComponent = true;
    this.productManagerService.getProductByCategoryIdAndPriceLessThan(0, 9999999999, 0, 10).subscribe({
      next: (res) => {
        this.products = res.data.content;
        this.isLoadingComponent = false;
      },
      error: (res) => {
        this.isLoadingComponent = false;
      },
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
    this.statusSelected = {};
    this.dataEditor = '<p>Enter description here!</p>';
  }
  saveProduct() {
    this.submitted = true;
    if (this.product.id) {
      // this.productManagerService.update(this.user).subscribe({
      //   next: (res) => {
      //     console.log(res);
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: 'Successful',
      //       detail: 'Updated',
      //       life: 1000,
      //     });
      //     this.getProduct();
      //   },
      //   error: (res) => {},
      // });
      // return;
    }
    this.formDataImage = new FormData();
    for (let file of this.fileUpload._files) {
      this.formDataImage.append('file', file);
    }
    this.product.categoryId = this.categorySelected.id;
    this.product.status = this.statusSelected.value;
    this.product.description = this.dataEditor;
    this.formDataImage.append('product', JSON.stringify(this.product));
    this.productManagerService.add(this.formDataImage).subscribe({
      next: (res) => {
        console.log(res);
        this.hideDialog();
        this.submitted = false;
      },
      error: (res) => {
        this.hideDialog();
        this.submitted = false;
      },
    });
  }
  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
    this.resetValueForm();
  }
  resetView() {
    this.isLoadingComponent = true;
    setTimeout(() => {
      this.getProduct();
      this.isLoadingComponent = false;
    }, 500);
  }
  editProduct(product: Product) {
    this.isLoadingComponent = true;
    setTimeout(() => {
      this.productDialog = true;
      this.product = { ...product };
      this.dataEditor = product.description!;
      this.statusSelected = { label: this.product.status ? 'ACTIVE' : 'INACTIVE', value: this.product.status! };
      this.categorySelected = { name: product.category!.name, id: product.category?.id, status: product.category?.status };
      this.isLoadingComponent = false;
    }, 50);
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
    this.tests = [
      { id: 'Admin', name: 'admin', status: 1 },
      { id: 'Client', name: 'client', status: 1 },
      { id: 'Manager', name: 'manager', status: 1 },
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
}
