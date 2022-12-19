import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  providers: [SocialLoginModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  constructor(private tokenStorageService: TokenStorageService) {}

  ngOnInit(): void {}
  logout() {
    this.tokenStorageService.signOut();
  }
}
