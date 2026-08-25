import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory } from '../../models/category.model';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
      <div class="card border-0 rounded-4 overflow-hidden position-relative mb-4 text-white shadow-sm"
           [style.background]="cat.gradientBackground"
           style="min-height: 220px;">
        <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-between position-relative z-1">
          <div style="max-width: 75%; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.75);">
            <i [class]="'bi ' + cat.iconClass + ' fs-3 mb-2 d-inline-block'"></i>
            <div class="text-uppercase fw-semibold tracking-wider small opacity-90">Livros PDF Grátis</div>
            <h1 class="display-6 fw-bold text-uppercase mt-2 mb-3">{{ cat.name }}</h1>
            <div class="border-top border-white border-2 opacity-75 w-25 mb-2"></div>
            <span class="text-uppercase opacity-90 small">{{ cat.name }}</span>
          </div>
        </div>
        <i [class]="'bi ' + cat.iconClass + ' position-absolute text-white watermark-header'"></i>
      </div>

      <!-- Barra de Busca Responsiva (Mobile & Desktop) -->
      <div class="search-container mb-4">
        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
          <span class="input-group-text bg-white border-0 ps-3 pe-2 text-muted">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control border-0 ps-2"
            placeholder="Buscar tópico ou assunto em {{ cat.name }}..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          @if (searchQuery()) {
            <button class="btn btn-white bg-white border-0 pe-3 text-muted" type="button" (click)="searchQuery.set('')">
              <i class="bi bi-x-circle-fill"></i>
            </button>
          }
        </div>
      </div>

      <p class="lead text-secondary fs-6 mb-4">
        {{ cat.description || 'Selecione um tópico para explorar os materiais disponíveis.' }}
      </p>

      <!-- Grade de Subcategorias / Tópicos Filtrados -->
      @if (filteredSubcategories().length > 0) {
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
          @for (sub of filteredSubcategories(); track sub.id) {
            <div class="col">
              <div class="card h-100 border-0 rounded-4 shadow-sm overflow-hidden hover-card"
                   [routerLink]="['/categoria', cat.slug, sub.slug]"
                   style="cursor: pointer;">
                
                <!-- Mini Banner do Tópico -->
                <div class="p-4 text-white d-flex flex-column justify-content-between position-relative overflow-hidden"
                     [style.background]="getSubcategoryBackground(sub, cat.gradientBackground)"
                     style="min-height: 140px;">
                  <div class="position-relative z-1">
                    <span class="text-uppercase fw-semibold small opacity-75 d-block mb-1">
                      <i [class]="'bi ' + cat.iconClass + ' me-1'"></i> TÓPICO
                    </span>
                    <h4 class="fw-bold text-uppercase m-0">{{ sub.name }}</h4>
                  </div>
                  <div class="position-relative z-1 mt-3">
                    <span class="small opacity-75 text-uppercase">{{ cat.name }}</span>
                  </div>
                  <i [class]="'bi ' + cat.iconClass + ' position-absolute text-white watermark-card'"></i>
                </div>

                <!-- Corpo do Card com Descrição e Badge de Contagem -->
                <div class="card-body p-4 d-flex flex-column justify-content-between bg-white">
                  <div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h5 class="fw-bold text-dark m-0">{{ sub.name }}</h5>
                      <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                        {{ (sub.subcategories?.length || 0) > 0 ? (sub.subcategories?.length + ' temas') : (sub.books.length + ' livros') }}
                      </span>
                    </div>
                    <p class="text-muted small mb-0 line-clamp-2">
                      {{ sub.description || 'Clique para acessar os livros e materiais disponíveis neste tópico.' }}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          }
        </div>
      } @else {
        <div class="alert alert-light border text-center py-5 rounded-4 shadow-sm">
          <i class="bi bi-journal-x fs-1 text-muted d-block mb-2"></i>
          @if (searchQuery()) {
            <p class="text-muted m-0">Nenhum tópico encontrado para "<strong>{{ searchQuery() }}</strong>".</p>
          } @else {
            <p class="text-muted m-0">Nenhum tópico cadastrado nesta categoria ainda.</p>
          }
        </div>
      }
    </div>
  `
})
export class CategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  category = signal<Category | null>(null);
  searchQuery = signal<string>('');

  // Filtragem dinâmica dos tópicos/subcategorias por nome ou descrição
  filteredSubcategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const subs = this.category()?.subcategories || [];
    if (!query) return subs;

    return subs.filter(sub =>
      sub.name.toLowerCase().includes(query) ||
      sub.description?.toLowerCase().includes(query) ||
      sub.books?.some(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.categoryService.getCategoryBySlug(slug).subscribe({
          next: (cat) => this.category.set(cat),
          error: (err) => console.error('Erro ao carregar categoria:', err)
        });
      }
    });
  }

  getSubcategoryBackground(sub: Subcategory, fallbackGradient: string): string {
    if (sub.imageUrl) {
      return `linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.70) 100%), url('${sub.imageUrl}') center/cover no-repeat`;
    }
    return fallbackGradient;
  }
}