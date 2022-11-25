import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserComponent,
    HomeComponent,
    HeaderComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  isShowSidebar = true;

  constructor() {}
  ngOnInit(): void {}
  showSidebar(isShowSidebar: boolean) {
    this.isShowSidebar = isShowSidebar;
  }
}
