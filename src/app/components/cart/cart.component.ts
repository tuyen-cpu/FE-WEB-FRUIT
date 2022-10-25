import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, InputTextareaModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
