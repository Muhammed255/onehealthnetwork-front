import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public userImage = 'assets/img/app/user.jpg';
  public userIsAuthenticated: boolean = false;

  authUser: any;

  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser();
    this.userIsAuthenticated = this.authService.getIsAuth();
    console.log('user is auth', this.userIsAuthenticated);
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(
      (isAuth) => {
        console.log('app init', this.userIsAuthenticated);
        console.log(isAuth);
        this.userIsAuthenticated = isAuth;
      },
      (err) => {
        console.log(err);
      }
    );

    if (localStorage.getItem('userId')) {
      this.authService
        .getUserById(localStorage.getItem('userId'))
        .subscribe((res) => {
          if (res.success) {
            this.authUser = res.user;
          }
        });
    }
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
