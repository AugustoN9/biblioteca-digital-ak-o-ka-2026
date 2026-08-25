import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory, Book } from '../../models/category.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-subcategory-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeUrlPipe],
  template: `
    <div class="container py-4" *ngIf="category() as cat">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none">Início</a></li>
          <li class="breadcrumb-item"><a [routerLink]="['/categoria', cat.slug]" class="text-decoration-none">{{ cat.name }}</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ subcategory()?.name }}</li>
        </ol>
      </nav>

      <!-- Banner Superior -->
      <div class="card border-0 rounded-4 overflow-hidden position-relative mb-4 text-white shadow-sm"
           [style.background]="getBannerBackground(subcategory(), cat.gradientBackground)"
           style="min-height: 220px;">
        <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-between position-relative z-1">
          <div style="max-width: 75%; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.75);">
            <i [class]="'bi ' + cat.iconClass + ' fs-3 mb-2 d-inline-block'"></i>
            <div class="text-uppercase fw-semibold tracking-wider small opacity-90">Livros PDF Grátis</div>
            <h1 class="display-6 fw-bold text-uppercase mt-2 mb-3">{{ subcategory()?.name }}</h1>
            <div class="border-top border-white border-2 opacity-75 w-25 mb-2"></div>
            <span class="text-uppercase opacity-90 small">{{ cat.name }} &bull; {{ subcategory()?.name }}</span>
          </div>
        </div>
        <i [class]="'bi ' + cat.iconClass + ' position-absolute text-white watermark-header'"></i>
      </div>

      <p class="lead text-secondary fs-6 mb-4">
        {{ subcategory()?.description || 'Clique sobre a capa do livro para ver detalhes, ler online ou fazer o download.' }}
      </p>

      <!-- Vitrine de Livros da Subcategoria -->
      @if (subcategory()?.books && subcategory()!.books.length > 0) {
        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 mb-5">
          @for (book of subcategory()!.books; track book.id) {
            <div class="col">
              <div class="book-cover-card" (click)="openBookDetails(book)">
                
                <!-- Botão de Favorito Rápido -->
                <button class="like-badge-btn" (click)="onLike($event, book)">
                  <i class="bi bi-heart-fill text-danger me-1"></i> {{ book.likes || 0 }}
                </button>

                <!-- Capa com Imagem Real -->
                @if (book.coverUrl) {
                  <img [src]="book.coverUrl" [alt]="book.title" class="book-cover-img">
                  <div class="book-overlay">
                    <h6 class="fw-bold m-0 text-truncate">{{ book.title }}</h6>
                    <small class="opacity-75 text-truncate d-block">{{ book.author }}</small>
                  </div>
                } @else {
                  <!-- Capa Padrão Estilizada -->
                  <div class="book-default-cover" [style.background]="cat.gradientBackground">
                    <div>
                      <span class="badge bg-danger mb-2">PDF</span>
                      <h6 class="fw-bold mb-1 line-clamp-3">{{ book.title }}</h6>
                    </div>
                    <div>
                      <hr class="border-white opacity-50 my-2">
                      <small class="opacity-75 d-block text-truncate">{{ book.author }}</small>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Vitrine de Subtópicos com 3º nível -->
      @if (subcategory()?.subcategories && subcategory()!.subcategories!.length > 0) {
        @for (child of subcategory()!.subcategories; track child.id) {
          <div class="mb-5">
            <h4 class="fw-bold text-dark border-bottom pb-2 mb-3">
              <i class="bi bi-tag-fill text-primary fs-6 me-2"></i>{{ child.name }}
            </h4>
            @if (child.books.length > 0) {
              <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                @for (book of child.books; track book.id) {
                  <div class="col">
                    <div class="book-cover-card" (click)="openBookDetails(book)">
                      <button class="like-badge-btn" (click)="onLike($event, book)">
                        <i class="bi bi-heart-fill text-danger me-1"></i> {{ book.likes || 0 }}
                      </button>
                      @if (book.coverUrl) {
                        <img [src]="book.coverUrl" [alt]="book.title" class="book-cover-img">
                        <div class="book-overlay">
                          <h6 class="fw-bold m-0 text-truncate">{{ book.title }}</h6>
                          <small class="opacity-75 text-truncate d-block">{{ book.author }}</small>
                        </div>
                      } @else {
                        <div class="book-default-cover" [style.background]="cat.gradientBackground">
                          <div>
                            <span class="badge bg-danger mb-2">PDF</span>
                            <h6 class="fw-bold mb-1 line-clamp-3">{{ book.title }}</h6>
                          </div>
                          <div>
                            <hr class="border-white opacity-50 my-2">
                            <small class="opacity-75 d-block text-truncate">{{ book.author }}</small>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-muted small">Nenhum livro cadastrado em {{ child.name }} ainda.</p>
            }
          </div>
        }
      }

      @if (subcategory()?.books?.length === 0 && (!subcategory()?.subcategories || subcategory()!.subcategories!.length === 0)) {
        <div class="alert alert-light border text-center py-5">
          <i class="bi bi-journal-x fs-1 text-muted d-block mb-2"></i>
          <p class="text-muted m-0">Nenhum livro cadastrado neste subtópico ainda.</p>
        </div>
      }
    </div>

    <!-- 1. Modal de Detalhes do Livro (Capa, Título, Autores, Resumo e Ações) -->
    @if (detailBook()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.65);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow overflow-hidden">
            <div class="modal-header border-0 pb-0">
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                <i class="bi bi-file-earmark-pdf-fill me-1"></i> Formato Digital PDF
              </span>
              <button type="button" class="btn-close" (click)="closeBookDetails()"></button>
            </div>
            
            <div class="modal-body p-4">
              <div class="row g-4">
                <!-- Coluna da Capa -->
                <div class="col-md-4 text-center">
                  @if (detailBook()?.coverUrl) {
                    <img [src]="detailBook()?.coverUrl" class="img-fluid rounded-3 shadow" style="max-height: 280px; object-fit: cover;">
                  } @else {
                    <div class="rounded-3 shadow p-4 text-white d-flex flex-column justify-content-between text-start" 
                         [style.background]="category()?.gradientBackground" 
                         style="height: 260px;">
                      <i class="bi bi-book fs-1 opacity-50"></i>
                      <h6 class="fw-bold">{{ detailBook()?.title }}</h6>
                    </div>
                  }
                  
                  <button class="btn btn-outline-danger btn-sm rounded-pill mt-3 w-100" (click)="onLike($event, detailBook()!)">
                    <i class="bi bi-heart-fill me-1"></i> Favoritar ({{ detailBook()?.likes || 0 }})
                  </button>
                </div>

                <!-- Coluna das Informações -->
                <div class="col-md-8 d-flex flex-column justify-content-between">
                  <div>
                    <h3 class="fw-bold text-dark mb-1">{{ detailBook()?.title }}</h3>
                    <p class="text-muted small mb-3">
                      <strong>Autor(es):</strong> {{ detailBook()?.author }} 
                      <span *ngIf="detailBook()?.pages" class="ms-2">&bull; {{ detailBook()?.pages }} páginas</span>
                    </p>
                    
                    <h6 class="fw-bold text-dark small text-uppercase tracking-wider">Resumo da Obra</h6>
                    <p class="text-secondary small" style="white-space: pre-line; max-height: 180px; overflow-y: auto;">
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

    <!-- 2. Modal do Leitor de PDF do Google Drive -->
    @if (selectedBook()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.75); z-index: 1060;">
        <div class="modal-dialog modal-xl modal-dialog-centered" style="height: 92vh;">
          <div class="modal-content h-100 rounded-4 overflow-hidden border-0 shadow">
            <div class="modal-header bg-dark text-white border-0 py-2 px-3">
              <h6 class="modal-title m-0 text-truncate">
                <i class="bi bi-book me-2"></i>{{ selectedBook()?.title }}
              </h6>
              <button type="button" class="btn-close btn-close-white" (click)="closeViewer()"></button>
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
export class SubcategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  category = signal<Category | null>(null);
  subcategory = signal<Subcategory | null>(null);

  detailBook = signal<Book | null>(null);
  selectedBook = signal<Book | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const categorySlug = params['slug'];
      const subSlug = params['subSlug'];

      if (categorySlug) {
        this.categoryService.getCategoryBySlug(categorySlug).subscribe({
          next: (cat) => {
            this.category.set(cat);
            const foundSub = cat.subcategories.find(s => s.slug === subSlug);
            this.subcategory.set(foundSub || null);
          }
        });
      }
    });
  }

  getBannerBackground(sub: Subcategory | null | undefined, fallbackGradient: string): string {
    if (sub?.imageUrl) {
      return `linear-gradient(135deg, rgba(49, 27, 146, 0.30) 0%, rgba(15, 5, 30, 0.45) 100%), url('${sub.imageUrl}') center/cover no-repeat`;
    }
    return fallbackGradient;
  }

  openBookDetails(book: Book) {
    this.detailBook.set(book);
  }

  closeBookDetails() {
    this.detailBook.set(null);
  }

  openViewer(book: Book) {
    this.selectedBook.set(book);
  }

  closeViewer() {
    this.selectedBook.set(null);
  }

  onLike(event: Event, book: Book) {
    event.stopPropagation(); // Evita abrir o modal ao clicar no botão de like
    this.categoryService.likeBook(book.id).subscribe({
      next: (res) => {
        book.likes = res.likes;
      },
      error: (err) => console.error('Erro ao curtir livro:', err)
    });
  }
}