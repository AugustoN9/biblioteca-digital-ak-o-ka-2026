import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div
      class="container py-5 d-flex justify-content-center align-items-center"
      style="min-height: 75vh;"
    >
      <div class="card border-0 shadow rounded-4 p-4 p-md-5" style="max-width: 420px; width: 100%;">
        <div class="text-center mb-4">
          <img
            src="assets/images/logoMinhaBiblioteca.png"
            alt="Logo"
            class="img-fluid mb-3 rounded-circle shadow-sm"
            style="width: 200px; height: 200px; object-fit: cover;"
          />
          <h3 class="fw-bold text-dark m-0">Acesso Restrito</h3>
          <p class="text-muted small mt-1">Painel Administrativo do Acervo</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-semibold small">Usuário</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="username"
                name="username"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold small">Senha</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-key"></i></span>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm"
            [disabled]="loading() || !username || !password"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span> Acessando...
            } @else {
              <i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Painel
            }
          </button>
        </form>

        <div class="text-center mt-4 border-top pt-3">
          <a routerLink="/" class="text-muted small text-decoration-none">
            <i class="bi bi-arrow-left me-1"></i> Voltar ao Portal
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Falha ao autenticar.');
      },
    });
  }
}
