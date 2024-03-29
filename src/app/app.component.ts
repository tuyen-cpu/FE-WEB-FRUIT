import { FormsModule } from '@angular/forms';
import { UserInforService } from './services/user-infor.service';
import { MessageService } from 'primeng/api';
import { TokenStorageService } from './services/token-storage.service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
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
//primeNg
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
//multi languge
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import UserManagerService from './services/admin/user-manager.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    MessageModule,
    FormsModule,
    HeaderComponent,
    ToastModule,
    FooterComponent,
    RouterModule,
    HomeComponent,
    SocialLoginModule,
    AvatarModule,
    AvatarGroupModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  title = 'FE-BAN-HANG';
  isShow!: boolean;
  isShowHeader!: boolean;
  topPosToStartShowing = 100;
  user!: User;
  @HostListener('window:scroll')
  checkScroll() {
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

  greeting: any;
  name: string;
  rooms: any;
  mess: any = [];
  roomSelected: any = 1;
  constructor(
    private tokenStorageService: TokenStorageService,
    private messageService: MessageService,
    private router: Router,
    private shareMessageService: ShareMessageService,
    public translateService: TranslateService,
    private userInforService: UserInforService,
    private userManagerService: UserManagerService,

  ) {
    translateService.addLangs(['en', 'vn']);
    translateService.setDefaultLang('en');
  }

  response = '';
  config = {
    title: 'ChatBot',
    subTitle: 'New Way of learning',
  };
  setData(message) {
    this.response = message;
  }
  getMessage($event) {
    console.log($event);
  }
  ngOnInit(): void {

    if (this.userInforService.user) {
      this.userManagerService.get(this.userInforService.user.id).subscribe({
        next: (res: any) => {
          this.updateCurrentUser(res.data);
        },
        error: (error) => {},
      });
    }

    this.shareMessageService.message.subscribe((data: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: data,
        life: 5000,
      });
    });
    this.shareMessageService.errorMessage.subscribe((data: any) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
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

  updateCurrentUser(user: User) {
    const newUser = <User>{
      ...this.userInforService.user,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
    };
    this.userInforService.user = newUser;
  }
}
