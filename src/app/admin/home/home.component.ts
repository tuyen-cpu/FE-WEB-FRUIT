import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Table, TableModule } from 'primeng/table';

import CategoryManagerService from 'src/app/services/admin/cagtegory-manager.service';
import OrderManagerService from 'src/app/services/admin/order-manager.service';
import UserManagerService from 'src/app/services/admin/user-manager.service';
import { MyCurrency } from 'src/app/pipes/my-currency.pipe';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableModule, MyCurrency],
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
  products = [
    { price: 200, name: 'sss', image: '12' },
    { price: 200, name: 'sss', image: '12' },
    { price: 200, name: 'sss', image: '12' },
  ];
  constructor(private route: ActivatedRoute, private orderManagerService: OrderManagerService, private userManagerService: UserManagerService) {}

  ngOnInit(): void {
    this.titleComponent = this.route.snapshot.data['title'];
    this.getTotalOrders();
    this.getTotalOrdersInDay();
    this.getTotalUsers();
    this.getTotalUsersInDay();
    this.getRevenue();
    this.getRevenueLastMonth();
    this.getRevenueCurrentMonth();
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
}
