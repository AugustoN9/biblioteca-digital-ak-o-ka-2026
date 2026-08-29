import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  //private apiUrl = 'http://localhost:3000/api/auth';
  private apiUrl = 'https://biblioteca-digital-ak-o-ka-2026.onrender.com/api/auth';

  isLoggedIn = signal<boolean>(!!localStorage.getItem('admin_token'));

  login(credentials: { username: string; password: string }): Observable<{ token: string; message: string }> {
    return this.http.post<{ token: string; message: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('admin_token', res.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}