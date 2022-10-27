import { DropdownDirective } from './../../directives/dropdown.directive';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MegaMenuModule,
    RouterModule,
    DropdownDirective,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  isSiteLogin = true;
  isShowSearchDropdownMobile = false;
  isShowAccountDropdown = false;
  isShowCategoryDropdown = false;
  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {}
  changeSiteAccount() {
    let siteLogin = this.el.nativeElement.querySelector('#site-login');
    let siteForgot = this.el.nativeElement.querySelector('#site-forgot');

    let accountDropdownList = this.el.nativeElement.querySelector(
      '.account-dropdown-list'
    );
    console.log(accountDropdownList.style);
    if (siteLogin.classList.contains('is-selected')) {
      siteLogin.classList.remove('is-selected');
      siteForgot.classList.add('is-selected');
      accountDropdownList.classList.add('height-forgot');
      accountDropdownList.classList.remove('height-login');
    } else {
      siteForgot.classList.remove('is-selected');
      siteLogin.classList.add('is-selected');
      accountDropdownList.classList.add('height-login');
      accountDropdownList.classList.remove('height-forgot');
    }
    this.isSiteLogin = !this.isSiteLogin;
  }
  changeShowSearchDropdownMobile() {
    this.isShowSearchDropdownMobile = !this.isShowSearchDropdownMobile;
  }
  changeShowAccountDropdown() {
    this.isShowAccountDropdown = !this.isShowAccountDropdown;
  }
  changeShowCategoryDropdown() {
    this.isShowCategoryDropdown = !this.isShowCategoryDropdown;
  }
}
