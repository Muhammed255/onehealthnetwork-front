import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

const BACKEND_API_URL = environment.BACKEND_URI + 'user/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  signup(name: string, email: string, password: string) {
    const singupBody = { name, email, password };
    this.http.post<{ success: boolean; msg: string }>(
      BACKEND_API_URL + 'signup',
      singupBody
    ).subscribe(
      (res) => {
        if (res.success) {
          this.router.navigateByUrl('/user/login');
        }
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }




  login(email: string, password: string) {
    const authData = { email: email, password: password };
    this.http
      .post<{
        success: boolean;
        msg: string;
        token: string;
        userId: string;
        expiresIn: number;
      }>(BACKEND_API_URL + 'login', authData)
      .subscribe(
        (response) => {
          if (response.success) {
            const token = response.token;
            this.token = token;
            if (token) {
              const expiresInDuration = response.expiresIn;
              this.setAuthTimer(expiresInDuration);
              this.isAuthenticated = true;
              this.userId = response.userId;
              this.authStatusListener.next(true);
              const now = new Date();
              const expirationDate = new Date(
                now.getTime() + expiresInDuration * 1000
              );
              console.log(expirationDate);
              this.saveAuthData(token, expirationDate, this.userId);
              this.router.navigateByUrl('/home');
            }
          }
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }


  getUserById(userId: string) {
    return this.http.get<{success: boolean, user: any}>(BACKEND_API_URL + userId);
  }


  getAllUsers() {
    return this.http.get<{success: boolean, users: any[]}>(BACKEND_API_URL + "all-users")
  }


  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.userId = null;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/user/login']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
  
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }
}
