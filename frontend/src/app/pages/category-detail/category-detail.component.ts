import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory } from '../../models/category.model';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4" *ngIf="category() as cat">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none">Início</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ cat.name }}</li>
        </ol>
      </nav>

      <!-- Banner Superior da Categoria -->
      <div
        class="card border-0 rounded-4 overflow-hidden position-relative mb-4 text-white shadow-sm"
        [style.background]="cat.gradientBackground"
        style="min-height: 220px;"
      >
        <div
          class="card-body p-4 p-md-5 d-flex flex-column justify-content-between position-relative z-1"
        >
          <div style="max-width: 75%;">
            <i [class]="'bi ' + cat.iconClass + ' fs-3 mb-2 d-inline-block'"></i>
            <div class="text-uppercase fw-semibold tracking-wider small opacity-75">
              Livros PDF Grátis
            </div>
            <h1 class="display-6 fw-bold text-uppercase mt-2 mb-3">{{ cat.name }}</h1>
            <div class="border-top border-white border-2 opacity-50 w-25 mb-2"></div>
            <span class="text-uppercase opacity-75 small">{{ cat.name }}</span>
          </div>
        </div>
        <i [class]="'bi ' + cat.iconClass + ' position-absolute text-white watermark-header'"></i>
      </div>

      <p class="lead text-secondary fs-6 mb-4">{{ cat.description }}</p>

      <!-- Grid com Cards das Subcategorias -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
        @for (sub of cat.subcategories; track sub.id) {
          <div class="col">
            <div
              class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden category-card-hover"
              [routerLink]="['/categoria', cat.slug, sub.slug]"
              role="button"
            >
              <!-- Banner Card Subcategoria (Renderiza Imagem com Overlay se existir, ou o degradê padrão) -->
              <div
                class="card-img-top p-4 position-relative overflow-hidden d-flex flex-column justify-content-between"
                [style.background]="getSubcategoryBackground(sub, cat.gradientBackground)"
                style="min-height: 170px;"
              >
                <div
                  class="position-relative z-1 text-white"
                  style="max-width: 75%; text-shadow: 0 2px 4px rgba(0,0,0,0.7);"
                >
                  <i [class]="'bi ' + cat.iconClass + ' fs-6 me-2'"></i>
                  <span class="text-uppercase fw-semibold tracking-wider small opacity-90"
                    >Tópico</span
                  >
                  <h4 class="fw-bold text-uppercase mt-2 mb-3 fs-5" style="line-height: 1.2;">
                    {{ sub.name }}
                  </h4>
                  <div class="border-top border-white border-2 opacity-75 w-25 mb-2"></div>
                  <small class="text-uppercase opacity-90 fw-light" style="font-size: 0.72rem;">{{
                    cat.name
                  }}</small>
                </div>
                <i
                  [class]="'bi ' + cat.iconClass + ' position-absolute text-white watermark-icon'"
                ></i>
              </div>

              <!-- Rodapé Card Subcategoria -->
              <div class="card-body d-flex flex-column justify-content-between bg-white p-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title fw-bold text-dark m-0 fs-6">{{ sub.name }}</h5>
                    <span
                      class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1"
                    >
                      {{ sub.books.length + (sub.subcategories?.length || 0) }}
                      {{ sub.subcategories ? 'temas' : 'livros' }}
                    </span>
                  </div>
                  <p class="card-text text-muted small mb-0">
                    {{
                      sub.description ||
                        'Clique para acessar os livros e materiais disponíveis neste tópico.'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  category = signal<Category | null>(null);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.categoryService.getCategoryBySlug(slug).subscribe({
          next: (data) => this.category.set(data),
          error: (err) => console.error('Erro ao buscar categoria:', err),
        });
      }
    });
  }

  // Gera o fundo com a imagem e camada de contraste, ou mantém o degradê caso não tenha foto
  getSubcategoryBackground(sub: Subcategory, fallbackGradient: string): string {
    if (sub.imageUrl) {
      // Opacidade reduzida para 45% / 60%, deixando os detalhes da lâmina bem visíveis
      return `linear-gradient(135deg, rgba(49, 27, 146, 0.45) 0%, rgba(15, 5, 30, 0.60) 100%), url('${sub.imageUrl}') center/cover no-repeat`;
    }
    return fallbackGradient;
  }
}
