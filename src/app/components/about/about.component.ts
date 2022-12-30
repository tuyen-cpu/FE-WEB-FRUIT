import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, AgmCoreModule.forRoot({ apiKey: '', libraries: ['places'] })],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
