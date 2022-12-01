import { DropdownDirective } from '../../directives/dropdown.directive';
import { UserInforService } from 'src/app/services/user-infor.service';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { User } from 'src/app/model/user.model';
@Component({
  selector: 'app-header-manager',
  standalone: true,
  imports: [CommonModule, AvatarModule, AvatarGroupModule, DropdownDirective],
  templateUrl: './header-manager.component.html',
  styleUrls: ['./header-manager.component.scss'],
})
export class HeaderManagerComponent implements OnInit {
  @Output() newItemEvent = new EventEmitter<boolean>();
  isShowSidebar = true;
  currentUser!: User;
  constructor(private router: Router, private tokenStorageService: TokenStorageService, private authService: AuthService) {}

  ngOnInit(): void {
    this.tokenStorageService.userChange.subscribe((data) => {
      this.currentUser = data;
    });
  }
  addClassToParent() {
    this.isShowSidebar = !this.isShowSidebar;
    this.newItemEvent.emit(this.isShowSidebar);
  }

  public logout(): void {
    this.tokenStorageService.signOut();
  }
}
