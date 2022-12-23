import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { Location } from '@angular/common';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  constructor(private _location: Location, private router: Router) {}

  ngOnInit(): void {}
  backToPreviousPage() {
    this._location.back();
  }
  goHome() {
    this.router.navigate(['/']);
  }
}
