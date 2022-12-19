import { MessageService } from 'primeng/api';
import { TokenStorageService } from './services/token-storage.service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { User } from './model/user.model';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ShareMessageService } from './services/share-message.service';

//multi languge
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    MessageModule,
    HeaderComponent,
    ToastModule,
    FooterComponent,
    RouterModule,
    HomeComponent,
    SocialLoginModule,
  ],
  providers: [MessageService],
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

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

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
  constructor(
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private router: Router,
    private shareMessageService: ShareMessageService,
    public translateService: TranslateService,
  ) {
    translateService.addLangs(['en', 'vn']);
    translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.shareMessageService.message.subscribe((data: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: data,
        life: 5000,
      });
    });
    this.tokenStorageService.userChange.subscribe((data) => {
      this.router.events.forEach((event) => {
        if (event instanceof NavigationStart) {
          if (event['url'].includes('/admin')) {
            this.isShowHeader = false;
          } else {
            this.isShowHeader = true;
          }
        }
      });
    });
  }
}
