import { UserService } from '../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  message: string = 'ss';
  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userService.verify(this.route.snapshot.queryParams['code']).subscribe({
      next: (response) => {
        this.message = response.data;
        console.log(this.message);
      },
      complete: () => {},
      error: (response) => {
        this.message = response.error.data;
        console.log(response);
      },
    });
  }
}
