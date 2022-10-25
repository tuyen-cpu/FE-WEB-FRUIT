import { DropdownDirective } from './../../directives/dropdown.directive';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {MegaMenuModule} from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,ButtonModule,MegaMenuModule,RouterModule,DropdownDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
    isSiteLogin=true;

  constructor(private renderer: Renderer2,private el: ElementRef) { }

  ngOnInit(): void {
   
  }
  changeSiteAccount(){
    this.isSiteLogin=!this.isSiteLogin;
    let siteLogin=this.el.nativeElement.querySelector("#site-login");
    let siteForgot=this.el.nativeElement.querySelector("#site-forgot");
    if(siteLogin.classList.contains('is-selected')){
      siteLogin.classList.remove('is-selected');
      siteForgot.classList.add('is-selected')
    }else{
      siteForgot.classList.remove('is-selected');
      siteLogin.classList.add('is-selected')
    }
  }
}
