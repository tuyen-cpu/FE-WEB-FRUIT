import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperModule } from 'swiper/angular';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';

// install Swiper modules
SwiperCore.use([FreeMode, Navigation, Thumbs]);
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, SwiperModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailComponent implements OnInit {
  thumbsSwiper: any;
  constructor() {}

  ngOnInit(): void {}
}
