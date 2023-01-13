import { Revenue } from './../../model/revenue.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

//primeNg
import { Table, TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
//component
import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import OrderManagerService from 'src/app/services/admin/order-manager.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import ProductManagerService from 'src/app/services/admin/product-manager.service';
import { Paginator } from 'src/app/model/paginator.model';
import AnalyticService from 'src/app/services/admin/analytic.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableModule, MyCurrency, ChartModule, PaginatorModule, ButtonModule, CheckboxModule, CalendarModule],
  templateUrl: './home.component.html',
  providers: [DatePipe],
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  titleComponent: string;
  totalOrders: number;
  totalOrdersInDay: number;
  totalUsers: number;
  totalUsersInDay: number;
  revenue: number;
  revenueLastMonth: number;
  revenueCurrentMonth: number;
  bestSellingProducts: any = [];
  bestSellingData: any;
  polarOptions: any;
  statisticalShipping: any;
  pieOptions: any;
  revenues: Revenue[] = [];
  paginator: Paginator = { totalElements: 0, pageNumber: 0, pageSize: 10 };
  isLoadingTable = false;
  paramsURL: {} = {};
  filter: {
    dayStart: number;
    dayEnd: number;
    monthStart: number;
    monthEnd: number;
    yearStart: number;
    yearEnd: number;
    page: number;
    size: number;
  };
  showDay = true;

  rangeDates: Date[] = [
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  ];
  cols = [
    { field: 'createdAt', header: 'Date' },
    { field: 'totalOrder', header: 'Total' },
    { field: 'grossRevenue', header: 'Gross Revenue' },
    { field: 'shipping', header: 'Shipping' },
    { field: 'netRevenue', header: 'Net Revenue' },
  ];
  constructor(
    private route: ActivatedRoute,
    private orderManagerService: OrderManagerService,
    private userManagerService: UserManagerService,
    private productManagerService: ProductManagerService,
    private router: Router,
    private analyticService: AnalyticService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.getTotalOrders();
    this.getTotalOrdersInDay();
    this.getTotalUsers();
    this.getTotalUsersInDay();
    this.getRevenue();
    this.getRevenueLastMonth();
    this.getRevenueCurrentMonth();
    this.getBestSellingProduct();
    this.getStatisticalShippingStatus();
    this.changeParams();
    this.polarOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
            font: {
              family: 'Montserrat',
              weight: 'bold',
            },
          },
        },
      },
      scales: {
        r: {
          grid: {
            color: 'rgba(160, 167, 181, .3)',
          },
        },
      },
    };
    this.pieOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
            font: {
              family: 'Montserrat',
              weight: 'bold',
            },
          },
        },
      },
    };
  }

  roundNumber = (number: number) => ~~number;
  bbb(current: any, las: any) {
    console.log(current, las);
  }
  getTotalOrders() {
    this.orderManagerService.getTotalOrders().subscribe({
      next: (res: any) => {
        this.totalOrders = res.data;
      },
      error: (res) => {},
    });
  }
  getTotalOrdersInDay() {
    this.orderManagerService.getTotalOrdersInDay().subscribe({
      next: (res: any) => {
        this.totalOrdersInDay = res.data;
      },
      error: (res) => {},
    });
  }
  getTotalUsers() {
    this.userManagerService.getTotalOrders().subscribe({
      next: (res: any) => {
        this.totalUsers = res.data;
      },
      error: (res) => {},
    });
  }
  getTotalUsersInDay() {
    this.userManagerService.getTotalOrdersInDay().subscribe({
      next: (res: any) => {
        this.totalUsersInDay = res.data;
      },
      error: (res) => {},
    });
  }
  getRevenue() {
    this.orderManagerService.getRevenue().subscribe({
      next: (res: any) => {
        this.revenue = res.data;
      },
      error: (res) => {},
    });
  }
  getRevenueLastMonth() {
    this.orderManagerService.getRevenueLastMonth().subscribe({
      next: (res: any) => {
        this.revenueLastMonth = res.data;
        console.log(res);
      },
      error: (res) => {},
    });
  }
  getRevenueCurrentMonth() {
    this.orderManagerService.getRevenueCurrentMonth().subscribe({
      next: (res: any) => {
        this.revenueCurrentMonth = res.data;
      },
      error: (res) => {},
    });
  }
  getBestSellingProduct() {
    this.productManagerService.getBestSelling().subscribe({
      next: (res: any) => {
        this.bestSellingProducts = res.data.content;
        console.log(this.bestSellingProducts);
        this.bestSellingData = {
          datasets: [
            {
              data: this.bestSellingProducts.map((e) => e.quantity),
              backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2', '#000', 'red', 'pink'],
              label: 'My dataset',
            },
          ],
          labels: this.bestSellingProducts.map((e) => e.name),
        };
      },
      error: (res) => {},
    });
  }
  getStatisticalShippingStatus() {
    this.orderManagerService.getStatisticalShippingStatus().subscribe({
      next: (res: any) => {
        this.statisticalShipping = {
          labels: res.data.map((e) => e.name),
          datasets: [
            {
              data: res.data.map((e) => e.quantity),

              // backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
              // hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'],
              backgroundColor: ['#66BB6A', '#694382', '#ffd8b2', '#c63737', '#feedaf', '#FFA726'],
              hoverBackgroundColor: ['#66BB6A', '#694382', '#ffd8b2', '#c63737', '#feedaf', '#FFB74D'],
            },
          ],
        };
      },
      error: (res) => {},
    });
  }
  selectData(event: any) {
    console.log(event);
  }
  convertDatesToString(dates: Date[]): string[] {
    return dates.map((date) => this.datePipe.transform(date, 'yyyy-MM-dd'));
  }
  convertDateToString(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  convertDateToDDMMYY(date: Date): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy');
  }
  yearOf(string: Date): number {
    const s = this.convertDateToString(string).split('-');
    return +s[0];
  }
  monthOf(string: Date): number {
    const s = this.convertDateToString(string).split('-');
    return +s[1];
  }
  dayOf(string: Date): number {
    const s = this.convertDateToString(string).split('-');
    return +s[2];
  }
  getWithDayMonthYearBetween() {
    this.isLoadingTable = true;
    this.analyticService
      .getWithDayMonthYearBetween({
        dayStart: this.dayOf(this.rangeDates[0]),
        dayEnd: this.dayOf(this.rangeDates[1]),
        monthStart: this.monthOf(this.rangeDates[0]),
        monthEnd: this.monthOf(this.rangeDates[1]),
        yearStart: this.yearOf(this.rangeDates[0]),
        yearEnd: this.yearOf(this.rangeDates[1]),
        page: this.paginator.pageNumber,
        size: this.paginator.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.revenues = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  getWithMonthYearBetween() {
    this.analyticService
      .getWithMonthYearBetween({
        monthStart: this.monthOf(this.rangeDates[0]),
        monthEnd: this.monthOf(this.rangeDates[1]),
        yearStart: this.yearOf(this.rangeDates[0]),
        yearEnd: this.yearOf(this.rangeDates[1]),
        page: this.paginator.pageNumber,
        size: this.paginator.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.revenues = res.data.content;
          this.isLoadingTable = false;
          this.paginator.totalElements = res.data.totalElements;
        },
        error: (res) => {
          this.isLoadingTable = false;
        },
      });
  }
  onChangeShowDay() {
    if (this.showDay) {
      this.getWithDayMonthYearBetween();
      return;
    }
    this.getWithMonthYearBetween();
  }
  exportCSV(dt: any) {
    if (this.showDay) {
      this.analyticService
        .getWithDayMonthYearBetween({
          dayStart: this.dayOf(this.rangeDates[0]),
          dayEnd: this.dayOf(this.rangeDates[1]),
          monthStart: this.monthOf(this.rangeDates[0]),
          monthEnd: this.monthOf(this.rangeDates[1]),
          yearStart: this.yearOf(this.rangeDates[0]),
          yearEnd: this.yearOf(this.rangeDates[1]),
          page: this.paginator.pageNumber,
          size: 999999999,
        })
        .subscribe({
          next: (res) => {
            // dt.value = res.data.content;
            this.exportExcel(
              res.data.content,
              'Summary ' + this.convertDateToDDMMYY(this.rangeDates[0]) + ' ' + this.convertDateToDDMMYY(this.rangeDates[1]),
            );
            // dt.exportCSV();
            // this.getWithDayMonthYearBetween();
          },
          error: (res) => {
            this.isLoadingTable = false;
          },
        });
    } else {
      this.analyticService
        .getWithMonthYearBetween({
          monthStart: this.monthOf(this.rangeDates[0]),
          monthEnd: this.monthOf(this.rangeDates[1]),
          yearStart: this.yearOf(this.rangeDates[0]),
          yearEnd: this.yearOf(this.rangeDates[1]),
          page: this.paginator.pageNumber,
          size: 99999999,
        })
        .subscribe({
          next: (res) => {
            this.exportExcel(
              res.data.content,
              'Summary ' + this.convertDateToDDMMYY(this.rangeDates[0]) + ' ' + this.convertDateToDDMMYY(this.rangeDates[1]),
            );
          },
          error: (res) => {
            this.isLoadingTable = false;
          },
        });
    }
  }
  exportExcel(data, fileName: string) {
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [this.cols.map((e) => e.header)]);
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.default(data, fileName + EXCEL_EXTENSION);
  }
  onClearDate() {
    this.rangeDates = [
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ];
  }
  onSelectDateFilter() {
    console.log(this.rangeDates);
    if (this.showDay) {
      this.getWithDayMonthYearBetween();
      return;
    }
    this.getWithMonthYearBetween();
  }

  changeParams() {
    this.route.queryParams.subscribe((res) => {
      if (res['page'] === undefined || res['page'] === null || +res['page'] <= 0) {
        this.paginator.pageNumber = 0;
      } else {
        this.paginator.pageNumber = res['page'] - 1;
      }
      this.paginator.pageSize = Number(res['size']) || 10;

      this.getWithDayMonthYearBetween();
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
}
