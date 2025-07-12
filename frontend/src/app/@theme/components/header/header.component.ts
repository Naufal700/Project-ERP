import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from '@nebular/theme';

import { AuthService } from '../../../@core/services/auth.service';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any = {};
  isLoggingOut = false;

  themes = [
    { value: 'default', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'cosmic', name: 'Cosmic' },
    { value: 'corporate', name: 'Corporate' },
  ];

  currentTheme = 'default';

  userMenu = [
    { title: 'Profile' },
    { title: 'Log out', icon: 'log-out-outline', data: { action: 'logout' } },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.user = this.authService.getUser();

    if (!this.user || !this.user.name) {
      this.user = {
        name: 'Guest',
        picture: 'assets/images/default-avatar.png',
      };
    }

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, bp]) => bp.width < xl),
        takeUntil(this.destroy$),
      ).subscribe(v => this.userPictureOnly = v);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      ).subscribe(t => this.currentTheme = t);

    // Tangkap klik menu logout
    this.menuService.onItemClick()
      .pipe(
        filter(({ item }) => item.data?.action === 'logout'),
        takeUntil(this.destroy$)
      ).subscribe(() => this.animateLogout());
  }

 animateLogout() {
  this.isLoggingOut = true;
  document.body.classList.add('logging-out'); // Tambahkan efek visual CSS

  setTimeout(() => {
    this.authService.logout().subscribe(() => {
      this.isLoggingOut = false;
      document.body.classList.remove('logging-out');
      this.router.navigate(['/auth/login']);
    });
  }, 60);
}


  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
