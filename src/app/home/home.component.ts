import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  users: any[];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.onFetchUsers();
  }

  onFetchUsers() {
    this.authService.getAllUsers().subscribe((res) => {
      if (res.success) {
        this.users = res.users;
      }
    });
  }
}
