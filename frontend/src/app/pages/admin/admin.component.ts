import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory } from '../../models/category.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 950px;">
      
      <!-- Cabeçalho do Painel -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold m-0"><i class="bi bi-shield-lock-fill text-primary me-2"></i>Painel Administrativo</h2>
          <small class="text-muted">Gerencie o acervo, categorias e tópicos de estudo</small>
        </div>
        <a routerLink="/" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i> Voltar ao Portal
        </a>
      </div>

      <!-- Alertas Globais -->
      @if (successMessage()) {
        <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage() }}
          <button type="button" class="btn-close" (click)="successMessage.set(null)"></button>
        </div>
      }

      @if (errorMessage()) {
        <div class="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage() }}
          <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
        </div>
      }

      <!-- Navegação por Abas -->
      <ul class="nav nav-pills nav-fill mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li class="nav-item">
          <button class="nav-link rounded-3 fw-semibold" [class.active]="currentTab() === 'books'" (click)="setTab('books')">
            <i class="bi bi-journal-plus me-1"></i> Cadastrar Livros
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3 fw-semibold" [class.active]="currentTab() === 'categories'" (click)="setTab('categories')">
            <i class="bi bi-collection-fill me-1"></i> Gerenciar Categorias
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link rounded-3 fw-semibold" [class.active]="currentTab() === 'subcategories'" (click)="setTab('subcategories')">
            <i class="bi bi-tags-fill me-1"></i> Gerenciar Subcategorias
          </button>
        </li>
      </ul>

      <!-- ============================================================= -->
      <!-- ABA 1: CADASTRAR LIVROS                                       -->
      <!-- ============================================================= -->
      @if (currentTab() === 'books') {
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h4 class="fw-bold mb-3 text-dark">Cadastrar Novo Livro / Material</h4>
          <form (ngSubmit)="saveBook()">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Categoria Principal *</label>
                <select class="form-select" [(ngModel)]="bookCategoryId" (change)="onBookCategoryChange()" name="bookCategoryId" required>
                  <option value="" disabled selected>Selecione uma categoria</option>
                  @for (cat of fullCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Subcategoria / Tópico *</label>
                <select class="form-select" [(ngModel)]="bookSubcategoryId" (change)="onBookSubcategoryChange()" name="bookSubcategoryId" [disabled]="!bookCategoryId" required>
                  <option value="" disabled selected>Selecione o tópico</option>
                  @for (sub of availableBookSubcategories(); track sub.id) {
                    <option [value]="sub.id">{{ sub.name }}</option>
                  }
                </select>
              </div>
            </div>

            @if (availableBookChildSubcategories().length > 0) {
              <div class="mb-3">
                <label class="form-label fw-semibold">Especialidade / Subtópico Específico</label>
                <select class="form-select" [(ngModel)]="bookChildSubcategoryId" name="bookChildSubcategoryId">
                  <option value="">Geral / Nenhum específico</option>
                  @for (child of availableBookChildSubcategories(); track child.id) {
                    <option [value]="child.id">{{ child.name }}</option>
                  }
                </select>
              </div>
            }

            <hr class="my-4 text-muted">

            <div class="mb-3">
              <label class="form-label fw-semibold">Título do Livro / Material *</label>
              <input type="text" class="form-control" [(ngModel)]="bookTitle" name="bookTitle" placeholder="Ex: Histologia Básica - Texto e Atlas" required>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-semibold">Autor(es) / Organização</label>
                <input type="text" class="form-control" [(ngModel)]="bookAuthor" name="bookAuthor" placeholder="Ex: Junqueira & Carneiro">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Páginas</label>
                <input type="number" class="form-control" [(ngModel)]="bookPages" name="bookPages" placeholder="Ex: 560">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Descrição Resumida</label>
              <textarea class="form-control" [(ngModel)]="bookDescription" name="bookDescription" rows="3" placeholder="Breve resumo sobre os temas cobertos na obra..."></textarea>
            </div>

            <!-- Palavras-chave / Tags de Busca -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Palavras-chave / Tags de Busca *</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-tags"></i></span>
                <input type="text" class="form-control" [(ngModel)]="bookKeywordsInput" name="bookKeywordsInput" placeholder="Ex: Tecido Epitelial, Células, Microscopia" required>
              </div>
              <small class="text-muted">Informe palavras-chave separadas por vírgula para indexação nas pesquisas.</small>
            </div>

            <!-- URL da Capa do Livro -->
            <div class="mb-3">
              <label class="form-label fw-semibold">URL da Capa do Livro (Opcional)</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-image"></i></span>
                <input type="text" class="form-control" [(ngModel)]="bookCoverUrl" name="bookCoverUrl" placeholder="Ex: assets/images/books/harper.jpg ou URL web">
              </div>
              <small class="text-muted">Se deixar em branco, o sistema exibirá uma capa temática automática.</small>
            </div>

            <!-- Link do Google Drive -->
            <div class="mb-4">
              <label class="form-label fw-semibold">Link ou ID de Compartilhamento do Google Drive *</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-google-play"></i></span>
                <input type="text" class="form-control" [(ngModel)]="bookRawDriveInput" (input)="extractDriveId()" name="bookRawDriveInput" placeholder="Cole o link completo do Google Drive" required>
              </div>
              @if (bookExtractedId()) {
                <small class="text-success mt-1 d-block">
                  <i class="bi bi-check-circle-fill me-1"></i> ID Extraído: <code>{{ bookExtractedId() }}</code>
                </small>
              }
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 rounded-3 fw-bold" [disabled]="isSubmitting() || !isValidBookForm()">
              @if (isSubmitting()) {
                <span class="spinner-border spinner-border-sm me-2"></span> Salvando...
              } @else {
                <i class="bi bi-cloud-arrow-up-fill me-2"></i> Adicionar Livro ao Acervo
              }
            </button>
          </form>
        </div>
      }

      <!-- ============================================================= -->
      <!-- ABA 2: GERENCIAR CATEGORIAS                                   -->
      <!-- ============================================================= -->
      @if (currentTab() === 'categories') {
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold m-0 text-dark">
              {{ editingCategoryId() ? 'Editar Categoria' : 'Nova Categoria Principal' }}
            </h4>
            @if (editingCategoryId()) {
              <button class="btn btn-outline-secondary btn-sm" (click)="cancelCategoryEdit()">
                Cancelar Edição
              </button>
            }
          </div>

          <form (ngSubmit)="saveCategory()">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Nome da Categoria *</label>
                <input type="text" class="form-control" [(ngModel)]="catFormName" name="catFormName" placeholder="Ex: Farmácia" required>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Ícone Bootstrap Icons</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i [class]="'bi ' + (catFormIcon || 'bi-journal')"></i></span>
                  <input type="text" class="form-control" [(ngModel)]="catFormIcon" name="catFormIcon" placeholder="bi-capsule">
                </div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Gradiente de Fundo (CSS)</label>
                <input type="text" class="form-control" [(ngModel)]="catFormGradient" name="catFormGradient" placeholder="linear-gradient(135deg, #0d6efd 0%, #002b66 100%)">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Imagem Ilustrativa (Opcional)</label>
                <input type="text" class="form-control" [(ngModel)]="catFormImage" name="catFormImage" placeholder="assets/images/category.png">
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Descrição</label>
              <textarea class="form-control" [(ngModel)]="catFormDescription" name="catFormDescription" rows="2" placeholder="Breve apresentação da área..."></textarea>
            </div>

            <button type="submit" class="btn btn-success w-100 py-2 rounded-3 fw-bold" [disabled]="isSubmitting() || !catFormName">
              <i class="bi bi-check2-circle me-1"></i> {{ editingCategoryId() ? 'Atualizar Categoria' : 'Cadastrar Categoria' }}
            </button>
          </form>
        </div>

        <!-- Tabela de Categorias Existentes -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-bold mb-3 text-dark">Categorias Cadastradas ({{ fullCategories().length }})</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Ícone</th>
                  <th>Subcategorias</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of fullCategories(); track cat.id) {
                  <tr>
                    <td>
                      <div class="fw-bold">{{ cat.name }}</div>
                      <small class="text-muted text-truncate d-block" style="max-width: 320px;">{{ cat.description }}</small>
                    </td>
                    <td><i [class]="'bi ' + cat.iconClass + ' fs-5 text-primary'"></i></td>
                    <td><span class="badge bg-secondary-subtle text-secondary border">{{ cat.subcategories ? cat.subcategories.length : 0 }} tópicos</span></td>
                    <td class="text-end">
                      <button class="btn btn-outline-primary btn-sm me-2" (click)="startEditCategory(cat)">
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-sm" (click)="deleteCategory(cat.id, cat.name)">
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                      Nenhuma categoria encontrada no banco de dados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- ABA 3: GERENCIAR SUBCATEGORIAS                                -->
      <!-- ============================================================= -->
      @if (currentTab() === 'subcategories') {
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold m-0 text-dark">
              {{ editingSubcategoryId() ? 'Editar Subcategoria' : 'Nova Subcategoria / Tópico' }}
            </h4>
            @if (editingSubcategoryId()) {
              <button class="btn btn-outline-secondary btn-sm" (click)="cancelSubcategoryEdit()">
                Cancelar Edição
              </button>
            }
          </div>

          <form (ngSubmit)="saveSubcategory()">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Categoria Pai *</label>
                <select class="form-select" [(ngModel)]="subFormCategoryId" name="subFormCategoryId" [disabled]="!!editingSubcategoryId()" required>
                  <option value="" disabled selected>Selecione a categoria</option>
                  @for (cat of fullCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Nome da Subcategoria *</label>
                <input type="text" class="form-control" [(ngModel)]="subFormName" name="subFormName" placeholder="Ex: Farmacologia Clínica" required>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Imagem Ilustrativa (Opcional)</label>
                <input type="text" class="form-control" [(ngModel)]="subFormImage" name="subFormImage" placeholder="assets/images/subcategory/foto.png">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Descrição</label>
                <input type="text" class="form-control" [(ngModel)]="subFormDescription" name="subFormDescription" placeholder="Breve resumo deste tópico...">
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100 py-2 rounded-3 fw-bold" [disabled]="isSubmitting() || !subFormCategoryId || !subFormName">
              <i class="bi bi-check2-circle me-1"></i> {{ editingSubcategoryId() ? 'Atualizar Subcategoria' : 'Cadastrar Subcategoria' }}
            </button>
          </form>
        </div>

        <!-- Filtro e Tabela de Subcategorias -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold m-0 text-dark">Subcategorias Cadastradas</h5>
            <div style="min-width: 250px;">
              <select class="form-select form-select-sm" [(ngModel)]="filterCategoryId" name="filterCategoryId">
                <option value="">Todas as Categorias</option>
                @for (cat of fullCategories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Subcategoria</th>
                  <th>Categoria Pai</th>
                  <th>Livros Cadastrados</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredSubcategoriesList(); track item.sub.id) {
                  <tr>
                    <td>
                      <div class="fw-bold">{{ item.sub.name }}</div>
                      <small class="text-muted text-truncate d-block" style="max-width: 280px;">{{ item.sub.description || 'Sem descrição' }}</small>
                    </td>
                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">{{ item.catName }}</span></td>
                    <td>{{ item.sub.books ? item.sub.books.length : 0 }} livros</td>
                    <td class="text-end">
                      <button class="btn btn-outline-primary btn-sm me-2" (click)="startEditSubcategory(item.catId, item.sub)">
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-sm" (click)="deleteSubcategory(item.catId, item.sub.id, item.sub.name)">
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                      Nenhuma subcategoria encontrada para a categoria selecionada.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminComponent implements OnInit {
  private categoryService = inject(CategoryService);

  currentTab = signal<'books' | 'categories' | 'subcategories'>('books');
  fullCategories = signal<Category[]>([]);
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // --- FORMULÁRIO LIVROS ---
  bookCategoryId = '';
  bookSubcategoryId = '';
  bookChildSubcategoryId = '';
  bookTitle = '';
  bookAuthor = '';
  bookDescription = '';
  bookPages: number | null = null;
  bookKeywordsInput = '';
  bookCoverUrl = '';
  bookRawDriveInput = '';
  bookExtractedId = signal<string>('');

  availableBookSubcategories = signal<Subcategory[]>([]);
  availableBookChildSubcategories = signal<Subcategory[]>([]);

  // --- FORMULÁRIO CATEGORIAS ---
  editingCategoryId = signal<string | null>(null);
  catFormName = '';
  catFormIcon = 'bi-journal-bookmark-fill';
  catFormGradient = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  catFormImage = '';
  catFormDescription = '';

  // --- FORMULÁRIO SUBCATEGORIAS ---
  editingSubcategoryId = signal<string | null>(null);
  subFormCategoryId = '';
  subFormName = '';
  subFormImage = '';
  subFormDescription = '';
  filterCategoryId = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.fullCategories.set(data || []);
        if (this.bookCategoryId) {
          const active = (data || []).find(c => c.id === this.bookCategoryId);
          this.availableBookSubcategories.set(active ? active.subcategories : []);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.errorMessage.set('Erro ao sincronizar dados com o servidor.');
      }
    });
  }

  setTab(tab: 'books' | 'categories' | 'subcategories') {
    this.currentTab.set(tab);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  // ==========================================
  // LÓGICA DE LIVROS
  // ==========================================
  onBookCategoryChange() {
    this.bookSubcategoryId = '';
    this.bookChildSubcategoryId = '';
    const active = this.fullCategories().find(c => c.id === this.bookCategoryId);
    this.availableBookSubcategories.set(active ? active.subcategories : []);
    this.availableBookChildSubcategories.set([]);
  }

  onBookSubcategoryChange() {
    this.bookChildSubcategoryId = '';
    const selected = this.availableBookSubcategories().find(s => s.id === this.bookSubcategoryId);
    this.availableBookChildSubcategories.set(selected?.subcategories || []);
  }

  extractDriveId() {
    const input = this.bookRawDriveInput.trim();
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);
    this.bookExtractedId.set(match && match[1] ? match[1] : input);
  }

  isValidBookForm(): boolean {
    return !!(
      this.bookCategoryId &&
      this.bookSubcategoryId &&
      this.bookTitle &&
      this.bookKeywordsInput &&
      this.bookExtractedId()
    );
  }

  saveBook() {
    if (!this.isValidBookForm()) return;
    this.isSubmitting.set(true);

    const keywordsArray = this.bookKeywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    this.categoryService.addBook({
      categoryId: this.bookCategoryId,
      subcategoryId: this.bookSubcategoryId,
      childSubcategoryId: this.bookChildSubcategoryId || undefined,
      title: this.bookTitle,
      author: this.bookAuthor,
      description: this.bookDescription,
      pages: this.bookPages || undefined,
      coverUrl: this.bookCoverUrl || undefined,
      keywords: keywordsArray,
      driveFileId: this.bookExtractedId()
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(`"${this.bookTitle}" cadastrado com sucesso!`);
        this.resetBookForm();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Erro ao salvar livro: ' + (err.error?.message || err.message));
      }
    });
  }

  resetBookForm() {
    this.bookTitle = '';
    this.bookAuthor = '';
    this.bookDescription = '';
    this.bookPages = null;
    this.bookKeywordsInput = '';
    this.bookCoverUrl = '';
    this.bookRawDriveInput = '';
    this.bookExtractedId.set('');
  }

  // ==========================================
  // LÓGICA DE CATEGORIAS
  // ==========================================
  startEditCategory(cat: Category) {
    this.editingCategoryId.set(cat.id);
    this.catFormName = cat.name;
    this.catFormIcon = cat.iconClass;
    this.catFormGradient = cat.gradientBackground;
    this.catFormImage = cat.imageUrl || '';
    this.catFormDescription = cat.description;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelCategoryEdit() {
    this.editingCategoryId.set(null);
    this.catFormName = '';
    this.catFormIcon = 'bi-journal-bookmark-fill';
    this.catFormGradient = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    this.catFormImage = '';
    this.catFormDescription = '';
  }

  saveCategory() {
    if (!this.catFormName) return;
    this.isSubmitting.set(true);

    const slug = this.catFormName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const payload = {
      id: this.editingCategoryId() || slug,
      slug: this.editingCategoryId() || slug,
      name: this.catFormName,
      iconClass: this.catFormIcon,
      gradientBackground: this.catFormGradient,
      imageUrl: this.catFormImage,
      description: this.catFormDescription
    };

    const request$ = this.editingCategoryId()
      ? this.categoryService.updateCategory(this.editingCategoryId()!, payload)
      : this.categoryService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(this.editingCategoryId() ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
        this.cancelCategoryEdit();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Erro ao salvar categoria: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteCategory(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}" e todos os seus tópicos?`)) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage.set(`Categoria "${name}" excluída.`);
        this.loadData();
      },
      error: (err) => this.errorMessage.set('Erro ao excluir categoria: ' + (err.error?.message || err.message))
    });
  }

  // ==========================================
  // LÓGICA DE SUBCATEGORIAS
  // ==========================================
  filteredSubcategoriesList(): { catId: string; catName: string; sub: Subcategory }[] {
    const list: { catId: string; catName: string; sub: Subcategory }[] = [];
    const categories = this.filterCategoryId
      ? this.fullCategories().filter(c => c.id === this.filterCategoryId)
      : this.fullCategories();

    for (const cat of categories) {
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          list.push({ catId: cat.id, catName: cat.name, sub });
        }
      }
    }
    return list;
  }

  startEditSubcategory(catId: string, sub: Subcategory) {
    this.editingSubcategoryId.set(sub.id);
    this.subFormCategoryId = catId;
    this.subFormName = sub.name;
    this.subFormImage = sub.imageUrl || '';
    this.subFormDescription = sub.description || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelSubcategoryEdit() {
    this.editingSubcategoryId.set(null);
    this.subFormCategoryId = '';
    this.subFormName = '';
    this.subFormImage = '';
    this.subFormDescription = '';
  }

  saveSubcategory() {
    if (!this.subFormCategoryId || !this.subFormName) return;
    this.isSubmitting.set(true);

    const slug = this.subFormName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const payload = {
      id: this.editingSubcategoryId() || slug,
      slug: this.editingSubcategoryId() || slug,
      name: this.subFormName,
      imageUrl: this.subFormImage,
      description: this.subFormDescription
    };

    const request$ = this.editingSubcategoryId()
      ? this.categoryService.updateSubcategory(this.subFormCategoryId, this.editingSubcategoryId()!, payload)
      : this.categoryService.createSubcategory(this.subFormCategoryId, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(this.editingSubcategoryId() ? 'Subcategoria atualizada!' : 'Subcategoria criada com sucesso!');
        this.cancelSubcategoryEdit();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Erro ao salvar subcategoria: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteSubcategory(catId: string, subId: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a subcategoria "${name}"?`)) return;
    this.categoryService.deleteSubcategory(catId, subId).subscribe({
      next: () => {
        this.successMessage.set(`Subcategoria "${name}" excluída.`);
        this.loadData();
      },
      error: (err) => this.errorMessage.set('Erro ao excluir subcategoria: ' + (err.error?.message || err.message))
    });
  }
}