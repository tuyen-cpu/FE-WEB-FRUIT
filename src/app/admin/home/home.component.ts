import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

//primeNg
import { Table, TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

//component
import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import OrderManagerService from 'src/app/services/admin/order-manager.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
import ProductManagerService from 'src/app/services/admin/product-manager.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableModule, MyCurrency, ChartModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
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
  constructor(
    private route: ActivatedRoute,
    private orderManagerService: OrderManagerService,
    private userManagerService: UserManagerService,
    private productManagerService: ProductManagerService,
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
}
