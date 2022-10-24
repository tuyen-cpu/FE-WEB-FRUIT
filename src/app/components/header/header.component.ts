import { DropdownDirective } from './../../directives/dropdown.directive';
import { Component, OnInit } from '@angular/core';
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
 

  constructor() { }

  ngOnInit(): void {
   
  }
  
}
