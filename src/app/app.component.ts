import { TokenStorageService } from './services/token-storage.service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { User } from './model/user.model';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule,
    HomeComponent,
    SocialLoginModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'FE-BAN-HANG';
  isShow!: boolean;
  isShowHeader!: boolean;
  topPosToStartShowing = 100;
  user!: User;
  @HostListener('window:scroll')
  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.

    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
  constructor(private tokenStorageService: TokenStorageService) {}
  ngOnInit(): void {
    this.tokenStorageService.userChange.subscribe((data) => {
      console.log(data);

      if (data && data.roles.includes('admin')) {
        this.isShowHeader = false;
      } else {
        this.isShowHeader = true;
      }
    });
  }
}
