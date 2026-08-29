import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page min-vh-100 d-flex flex-column bg-light">
      
      <!-- Cabeçalho Panorâmico com a Imagem de Fundo (livros-banner.png) -->
      <div class="auth-header position-relative text-white text-center py-5 px-3">
        <div class="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style="z-index: 0; background: url('assets/images/livros-banner.png') center/cover no-repeat;">
          <!-- Overlay escuro para destacar o texto -->
          <div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: rgba(0, 0, 0, 0.65);"></div>
        </div>
        
        <div class="container position-relative py-4" style="z-index: 1;">
          <h1 class="fw-bold display-6 mb-2">Acervo Digital de Estudos</h1>
          <p class="text-white fw-medium mx-auto" style="max-width: 550px; font-size: 1.05rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
            {{ isLoginMode() ? 'Acesse sua conta para gerenciar e baixar seus materiais científicos.' : 'Crie sua conta gratuita para começar a explorar o acervo completo.' }}
          </p>
        </div>
      </div>

      <!-- Container do Formulário Centralizado -->
      <div class="container d-flex justify-content-center align-items-center flex-grow-1 py-5">
        <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white w-100" style="max-width: 440px; margin-top: -60px; position: relative; z-index: 2;">
          
          <!-- Logo do Projeto no Topo do Card -->
          <div class="text-center mb-3">
            <img 
              src="assets/images/logoMinhaBiblioteca.png" 
              alt="Logo Acervo Digital" 
              class="rounded-circle shadow-sm border border-2 border-white"
              style="width: 75px; height: 75px; object-fit: cover;"
            />
          </div>

          <div class="text-center mb-4">
            <h3 class="fw-bold text-dark m-0 fs-4 mb-3">{{ isLoginMode() ? 'USER LOGIN' : 'CRIAR CONTA' }}</h3>
            
            <!-- Botões Entrar e Cadastrar do mesmo tamanho e centralizados -->
            <div class="d-flex justify-content-center gap-2 w-100 px-2">
              <button 
                type="button" 
                class="btn btn-sm py-2 rounded-pill fw-semibold flex-fill transition-all shadow-sm"
                [class.btn-success]="isLoginMode()"
                [class.btn-outline-secondary]="!isLoginMode()"
                (click)="setMode(true)"
              >
                Entrar
              </button>
              <button 
                type="button" 
                class="btn btn-sm py-2 rounded-pill fw-semibold flex-fill transition-all shadow-sm"
                [class.btn-success]="!isLoginMode()"
                [class.btn-outline-secondary]="isLoginMode()"
                (click)="setMode(false)"
              >
                Cadastrar
              </button>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="alert alert-success py-2 px-3 small rounded-3 mb-3" role="alert">
              <i class="bi bi-check-circle-fill me-1"></i> {{ successMessage() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            
            <!-- Campo Nome (Visível apenas no Cadastro) -->
            @if (!isLoginMode()) {
              <div class="mb-3">
                <label class="form-label text-muted fw-bold small text-uppercase">Nome Completo</label>
                <div class="input-group shadow-sm rounded-pill overflow-hidden border">
                  <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-person-badge"></i></span>
                  <input
                    type="text"
                    class="form-control border-0 py-2 shadow-none"
                    [(ngModel)]="name"
                    name="name"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>
            }

            <!-- Campo E-mail -->
            <div class="mb-3">
              <label class="form-label text-muted fw-bold small text-uppercase">E-mail</label>
              <div class="input-group shadow-sm rounded-pill overflow-hidden border">
                <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-person"></i></span>
                <input
                  type="email"
                  class="form-control border-0 py-2 shadow-none"
                  [(ngModel)]="username"
                  name="username"
                  placeholder="seu-email@exemplo.com"
                  required
                />
              </div>
            </div>

            <!-- Campo Senha -->
            <div class="mb-4">
              <label class="form-label text-muted fw-bold small text-uppercase">Senha</label>
              <div class="input-group shadow-sm rounded-pill overflow-hidden border">
                <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-lock"></i></span>
                <input
                  type="password"
                  class="form-control border-0 py-2 shadow-none"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-4 small">
              @if (isLoginMode()) {
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberMe">
                  <label class="form-check-label text-muted" for="rememberMe">Lembrar</label>
                </div>
                <a href="javascript:void(0)" class="text-success text-decoration-none fw-semibold">Esqueceu a senha?</a>
              } @else {
                <span class="text-muted">Preencha os campos para registrar seu acesso.</span>
              }
            </div>

            <button
              type="submit"
              class="btn btn-success w-100 py-2.5 rounded-pill fw-bold shadow-sm transition-all"
              [disabled]="loading() || !username || !password || (!isLoginMode() && !name)"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2"></span> Processando...
              } @else {
                {{ isLoginMode() ? 'Login' : 'Criar Conta' }}
              }
            </button>
          </form>

          <div class="text-center mt-4 border-top pt-3">
            <a href="/" class="text-muted small text-decoration-none">
              <i class="bi bi-arrow-left me-1"></i> Voltar ao Portal
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-header {
      min-height: 260px;
      display: flex;
      align-items: center;
    }
    .btn-success {
      background-color: #2e7d32;
      border-color: #2e7d32;
      &:hover {
        background-color: #1b4d3e;
        border-color: #1b4d3e;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal<boolean>(true);
  username = '';
  name = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  setMode(login: boolean) {
    this.isLoginMode.set(login);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.username = '';
    this.name = '';
    this.password = '';
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isLoginMode()) {
      this.authService.login({ email: this.username, password: this.password }).subscribe({
        next: (res) => {
          this.loading.set(false);
          // Redirecionamento condicional baseado no perfil
          if (res.user?.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Falha ao autenticar.');
        },
      });
    } else {
      this.authService.register({ name: this.name, email: this.username, password: this.password }).subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Conta criada com sucesso! Realizando login...');
          
          setTimeout(() => {
            this.authService.login({ email: this.username, password: this.password }).subscribe({
              next: (res) => {
                if (res.user?.role === 'admin') {
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/']);
                }
              },
              error: () => {
                this.setMode(true);
                this.successMessage.set('Conta criada! Faça login com suas credenciais.');
              }
            });
          }, 800);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Falha ao criar conta. Tente novamente.');
        }
      });
    }
  }
}