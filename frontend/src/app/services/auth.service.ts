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
  private apiUrl = 'https://biblioteca-digital-ak-o-ka-2026.onrender.com/api/auth';

  isLoggedIn = signal<boolean>(!!localStorage.getItem('admin_token'));

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('admin_token', res.token);
        if (res.user) {
          localStorage.setItem('user_data', JSON.stringify(res.user));
        }
        this.isLoggedIn.set(true);
      })
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_data');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  getUserData(): any {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  getUserFirstName(): string {
    const user = this.getUserData();
    if (!user || !user.name) return 'Usuário';
    return user.name.split(' ')[0]; // Retorna apenas o primeiro nome
  }

  isAdmin(): boolean {
    const user = this.getUserData();
    return user && user.role === 'admin';
  }
}