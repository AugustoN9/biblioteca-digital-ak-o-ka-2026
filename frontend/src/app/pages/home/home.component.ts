import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CategorySummary, SearchBookResult, Book } from '../../models/category.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SafeUrlPipe],
  template: `
    <div class="container py-4">
      
      <!-- Cabeçalho Principal com Logo -->
      <div class="text-center mb-3">
        <img src="assets/images/logoMinhaBiblioteca.png" 
             alt="Logo Minha Biblioteca" 
             class="img-fluid mb-3"
             style="max-height: 140px; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(0, 150, 136, 0.25));">
        <h1 class="fw-bold display-6">Biblioteca Digital de Livros PDF</h1>
        <p class="text-muted lead fs-6 mb-3">Selecione uma categoria para explorar os materiais disponíveis</p>
      </div>

      <!-- Container de Busca Unificada (Fixo no Mobile) -->
      <div class="sticky-search-mobile">
        <div class="row justify-content-center m-0">
          <div class="col-12 col-md-8 col-lg-6 position-relative px-2">
            <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border bg-white">
              <span class="input-group-text bg-white border-0 ps-3 ps-md-4 text-primary">
                <i class="bi bi-search fs-5"></i>
              </span>
              <input type="text" 
                     class="form-control border-0 py-2 py-md-3 shadow-none fs-6" 
                     [(ngModel)]="searchQuery" 
                     (input)="onSearchInput()"
                     placeholder="Buscar título, autor, assunto ou palavra-chave...">
              @if (searchQuery) {
                <button class="btn btn-white bg-white border-0 text-muted pe-3 pe-md-4" (click)="clearSearch()">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              }
            </div>

            <!-- Dropdown / Resultados em Tempo Real -->
            @if (searchQuery.trim().length > 1) {
              <div class="card position-absolute w-100 mt-2 shadow-lg border-0 rounded-4 text-start z-3 overflow-hidden" 
                   style="max-height: 380px; overflow-y: auto; left: 0;">
                @if (isSearching()) {
                  <div class="p-4 text-center text-muted">
                    <span class="spinner-border spinner-border-sm me-2"></span> Pesquisando no acervo...
                  </div>
                } @else if (searchResults().length > 0) {
                  <div class="list-group list-group-flush">
                    @for (book of searchResults(); track book.id) {
                      <div class="list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between" 
                           role="button"
                           (click)="openBookDetails(book)">
                        <div class="d-flex align-items-center gap-3">
                          @if (book.coverUrl) {
                            <img [src]="book.coverUrl" class="rounded shadow-sm" style="width: 40px; height: 55px; object-fit: cover;">
                          } @else {
                            <div class="bg-danger-subtle text-danger rounded d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 55px;">
                              PDF
                            </div>
                          }
                          <div>
                            <div class="fw-bold text-dark mb-0 fs-6">{{ book.title }}</div>
                            <small class="text-muted d-block">{{ book.author }}</small>
                            <span class="badge bg-light text-secondary border mt-1 small">
                              {{ book.categoryName }} &bull; {{ book.subcategoryName }}
                            </span>
                          </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted"></i>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-4 text-center text-muted">
                    <i class="bi bi-search fs-3 d-block mb-1 opacity-50"></i>
                    Nenhum livro ou assunto encontrado para "<strong>{{ searchQuery }}</strong>".
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Indicadores de Carregamento -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="text-muted">Carregando acervo...</p>
        </div>
      }

      <!-- Indicador de Erro -->
      @if (errorMessage()) {
        <div class="alert alert-danger shadow-sm rounded-3 p-4 my-4">
          <h5 class="alert-heading fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i> Não foi possível carregar os dados</h5>
          <p class="mb-0">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Grid de Categorias -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-2">
        @for (category of categories(); track category.id) {
          <div class="col">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden category-card-hover" 
                 [routerLink]="['/categoria', category.slug]" 
                 role="button">
              
              <!-- Banner Card com Gradiente e Marca d'água -->
              <div class="card-img-top p-4 position-relative overflow-hidden d-flex flex-column justify-content-between"
                   [style.background]="getCardBackground(category)"
                   style="min-height: 180px;">
                <div class="position-relative z-1 text-white" style="max-width: 75%; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">
                  <i [class]="'bi ' + category.iconClass + ' fs-5 me-2'"></i>
                  <span class="text-uppercase fw-semibold tracking-wider small opacity-90">Livros PDF Grátis</span>
                  <h3 class="fw-bold text-uppercase mt-2 mb-3 fs-5" style="line-height: 1.2;">{{ category.name }}</h3>
                  <div class="border-top border-white border-2 opacity-75 w-25 mb-2"></div>
                  <small class="text-uppercase opacity-90 fw-light" style="font-size: 0.75rem;">{{ category.name }}</small>
                </div>
                <i [class]="'bi ' + category.iconClass + ' position-absolute text-white watermark-icon'"></i>
              </div>

              <!-- Rodapé Card -->
              <div class="card-body d-flex flex-column justify-content-between bg-white p-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title fw-bold text-dark m-0 fs-6">{{ category.name }}</h5>
                    <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1">
                      {{ category.subcategoriesCount }} temas
                    </span>
                  </div>
                  <p class="card-text text-muted small mb-0">{{ category.description }}</p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal de Detalhes do Livro Encontrado pela Busca -->
    @if (detailBook()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.65); z-index: 1055;">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow overflow-hidden">
            <div class="modal-header border-0 pb-0">
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                <i class="bi bi-file-earmark-pdf-fill me-1"></i> Formato Digital PDF
              </span>
              <button type="button" class="btn-close" (click)="detailBook.set(null)"></button>
            </div>
            
            <div class="modal-body p-4">
              <div class="row g-4">
                <!-- Capa -->
                <div class="col-md-4 text-center">
                  @if (detailBook()?.coverUrl) {
                    <img [src]="detailBook()?.coverUrl" class="img-fluid rounded-3 shadow" style="max-height: 280px; object-fit: cover;">
                  } @else {
                    <div class="rounded-3 shadow p-4 text-white d-flex flex-column justify-content-between text-start bg-dark" style="height: 260px;">
                      <i class="bi bi-book fs-1 opacity-50"></i>
                      <h6 class="fw-bold">{{ detailBook()?.title }}</h6>
                    </div>
                  }
                  
                  <button class="btn btn-outline-danger btn-sm rounded-pill mt-3 w-100" (click)="onLike($event, detailBook()!)">
                    <i class="bi bi-heart-fill me-1"></i> Favoritar ({{ detailBook()?.likes || 0 }})
                  </button>
                </div>

                <!-- Informações e Ações -->
                <div class="col-md-8 d-flex flex-column justify-content-between">
                  <div>
                    <h3 class="fw-bold text-dark mb-1">{{ detailBook()?.title }}</h3>
                    <p class="text-muted small mb-2">
                      <strong>Autor(es):</strong> {{ detailBook()?.author }} 
                      <span *ngIf="detailBook()?.pages" class="ms-2">&bull; {{ detailBook()?.pages }} páginas</span>
                    </p>

                    @if (detailBook()?.keywords && detailBook()!.keywords!.length > 0) {
                      <div class="mb-3">
                        @for (kw of detailBook()!.keywords!; track kw) {
                          <span class="badge bg-secondary-subtle text-secondary me-1"><i class="bi bi-tag-fill me-1"></i>{{ kw }}</span>
                        }
                      </div>
                    }
                    
                    <h6 class="fw-bold text-dark small text-uppercase tracking-wider">Resumo da Obra</h6>
                    <p class="text-secondary small" style="white-space: pre-line; max-height: 160px; overflow-y: auto;">
                      {{ detailBook()?.description || 'Nenhum resumo detalhado informado para este material.' }}
                    </p>
                  </div>

                  <div class="d-flex gap-2 pt-3 border-top mt-3">
                    <button class="btn btn-outline-primary flex-fill fw-semibold" (click)="openViewer(detailBook()!)">
                      <i class="bi bi-eye me-1"></i> Ler Online
                    </button>
                    <a [href]="'https://drive.google.com/uc?export=download&id=' + detailBook()?.driveFileId" target="_blank" class="btn btn-primary flex-fill fw-semibold">
                      <i class="bi bi-download me-1"></i> Baixar PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal do Leitor de PDF do Google Drive -->
    @if (selectedBook()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.75); z-index: 1060;">
        <div class="modal-dialog modal-xl modal-dialog-centered" style="height: 92vh;">
          <div class="modal-content h-100 rounded-4 overflow-hidden border-0 shadow">
            <div class="modal-header bg-dark text-white border-0 py-2 px-3">
              <h6 class="modal-title m-0 text-truncate">
                <i class="bi bi-book me-2"></i>{{ selectedBook()?.title }}
              </h6>
              <button type="button" class="btn-close btn-close-white" (click)="selectedBook.set(null)"></button>
            </div>
            <div class="modal-body p-0 bg-secondary">
              <iframe [src]="'https://drive.google.com/file/d/' + selectedBook()?.driveFileId + '/preview' | safeUrl"
                      width="100%" 
                      height="100%" 
                      class="border-0">
              </iframe>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = signal<CategorySummary[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Busca
  searchQuery = '';
  searchResults = signal<SearchBookResult[]>([]);
  isSearching = signal<boolean>(false);
  detailBook = signal<SearchBookResult | null>(null);
  selectedBook = signal<Book | null>(null);

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(`Falha na requisição HTTP: ${err.message || 'Verifique o backend'}`);
        this.loading.set(false);
      }
    });
  }

  onSearchInput() {
    const q = this.searchQuery.trim();
    if (q.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.categoryService.searchBooks(q).subscribe({
      next: (data) => {
        this.searchResults.set(data);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  openBookDetails(book: SearchBookResult) {
    this.detailBook.set(book);
  }

  openViewer(book: Book) {
    this.selectedBook.set(book);
  }

  onLike(event: Event, book: Book) {
    event.stopPropagation();
    this.categoryService.likeBook(book.id).subscribe({
      next: (res) => {
        book.likes = res.likes;
      }
    });
  }

  getCardBackground(category: CategorySummary): string {
    if (category.imageUrl) {
      return `linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%), url('${category.imageUrl}') center/cover no-repeat`;
    }
    return category.gradientBackground;
  }
}