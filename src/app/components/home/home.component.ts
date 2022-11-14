import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, CarouselModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  backgrounds: any = [
    'slideshow_1.webp',
    'slideshow_2.webp',
    'slideshow_3.webp',
  ];
  categories: any = ['1', '2', '3', '4'];
  responsiveOptions: any;
  responsiveCateOptions: any;

  constructor() {}

  ngOnInit(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 3,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 3,
      },
    ];
    this.responsiveCateOptions = [
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 3,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 3,
      },
    ];
  }
}
