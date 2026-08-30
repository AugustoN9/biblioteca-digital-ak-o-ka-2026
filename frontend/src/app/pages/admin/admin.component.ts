import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory, Book } from '../../models/category.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 950px;">
      <!-- Cabeçalho do Painel -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold m-0">
            <i class="bi bi-shield-lock-fill text-primary me-2"></i>Painel Administrativo
          </h2>
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
          <button
            class="nav-link rounded-3 fw-semibold"
            [class.active]="currentTab() === 'books'"
            (click)="setTab('books')"
          >
            <i class="bi bi-journal-plus me-1"></i> Cadastrar Livros
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 fw-semibold"
            [class.active]="currentTab() === 'manage-books'"
            (click)="setTab('manage-books')"
          >
            <i class="bi bi-journal-text me-1"></i> Gerenciar Livros
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 fw-semibold"
            [class.active]="currentTab() === 'categories'"
            (click)="setTab('categories')"
          >
            <i class="bi bi-collection-fill me-1"></i> Gerenciar Categorias
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 fw-semibold"
            [class.active]="currentTab() === 'subcategories'"
            (click)="setTab('subcategories')"
          >
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
                <select
                  class="form-select"
                  [(ngModel)]="bookCategoryId"
                  (change)="onBookCategoryChange()"
                  name="bookCategoryId"
                  required
                >
                  <option value="" disabled selected>Selecione uma categoria</option>
                  @for (cat of fullCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Subcategoria / Tópico *</label>
                <select
                  class="form-select"
                  [(ngModel)]="bookSubcategoryId"
                  (change)="onBookSubcategoryChange()"
                  name="bookSubcategoryId"
                  [disabled]="!bookCategoryId"
                  required
                >
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
                <select
                  class="form-select"
                  [(ngModel)]="bookChildSubcategoryId"
                  name="bookChildSubcategoryId"
                >
                  <option value="">Geral / Nenhum específico</option>
                  @for (child of availableBookChildSubcategories(); track child.id) {
                    <option [value]="child.id">{{ child.name }}</option>
                  }
                </select>
              </div>
            }

            <hr class="my-4 text-muted" />

            <div class="mb-3">
              <label class="form-label fw-semibold">Título do Livro / Material *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="bookTitle"
                name="bookTitle"
                placeholder="Ex: Histologia Básica - Texto e Atlas"
                required
              />
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-semibold">Autor(es) / Organização</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="bookAuthor"
                  name="bookAuthor"
                  placeholder="Ex: Junqueira & Carneiro"
                />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Páginas</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="bookPages"
                  name="bookPages"
                  placeholder="Ex: 560"
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Descrição Resumida</label>
              <textarea
                class="form-control"
                [(ngModel)]="bookDescription"
                name="bookDescription"
                rows="3"
                placeholder="Breve resumo sobre os temas cobertos na obra..."
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Palavras-chave / Tags de Busca *</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-tags"></i></span>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="bookKeywordsInput"
                  name="bookKeywordsInput"
                  placeholder="Ex: Tecido Epitelial, Células, Microscopia"
                  required
                />
              </div>
              <small class="text-muted"
                >Informe palavras-chave separadas por vírgula para indexação nas pesquisas.</small
              >
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">URL da Capa do Livro (Opcional)</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-image"></i></span>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="bookCoverUrl"
                  name="bookCoverUrl"
                  placeholder="Ex: assets/images/books/harper.jpg ou URL web"
                />
              </div>
              <small class="text-muted"
                >Se deixar em branco, o sistema exibirá uma capa temática automática.</small
              >
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold"
                >Link ou ID de Compartilhamento do Google Drive *</label
              >
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-google-play"></i></span>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="bookRawDriveInput"
                  (input)="extractDriveId()"
                  name="bookRawDriveInput"
                  placeholder="Cole o link completo do Google Drive"
                  required
                />
              </div>
              @if (bookExtractedId()) {
                <small class="text-success mt-1 d-block">
                  <i class="bi bi-check-circle-fill me-1"></i> ID Extraído:
                  <code>{{ bookExtractedId() }}</code>
                </small>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 rounded-3 fw-bold"
              [disabled]="isSubmitting() || !isValidBookForm()"
            >
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
      <!-- ABA: GERENCIAR LIVROS (COM FILTROS E PAGINAÇÃO)               -->
      <!-- ============================================================= -->
      @if (currentTab() === 'manage-books') {
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h4 class="fw-bold mb-3 text-dark">
            <i class="bi bi-search text-primary me-2"></i>Filtrar e Gerenciar Acervo
          </h4>

          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small fw-bold">Filtrar por Categoria</label>
              <select
                class="form-select"
                [(ngModel)]="manageFilterCategoryId"
                (change)="onManageCategoryChange()"
                name="manageFilterCategoryId"
              >
                <option value="">Todas as Categorias</option>
                @for (cat of fullCategories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-bold">Filtrar por Subcategoria</label>
              <select
                class="form-select"
                [(ngModel)]="manageFilterSubcategoryId"
                (change)="currentPage.set(1)"
                name="manageFilterSubcategoryId"
              >
                <option value="">Todas as Subcategorias</option>
                @for (sub of availableManageSubcategories(); track sub.id) {
                  <option [value]="sub.id">{{ sub.name }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-bold">Busca Rápida (Título, Autor ou ID)</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="manageFilterQuery"
                (input)="currentPage.set(1)"
                name="manageFilterQuery"
                placeholder="Ex: book-1740... ou Histologia"
              />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle border">
              <thead class="table-light">
                <tr>
                  <th>ID do Livro</th>
                  <th>Capa</th>
                  <th>Título / Autor</th>
                  <th>Subcategoria</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (item of paginatedBooksList(); track item.book.id) {
                  <tr>
                    <td>
                      <code class="text-primary fw-bold user-select-all">{{ item.book.id }}</code>
                    </td>
                    <td>
                      @if (item.book.coverUrl) {
                        <img
                          [src]="item.book.coverUrl"
                          class="rounded shadow-sm"
                          style="width: 35px; height: 50px; object-fit: cover;"
                        />
                      } @else {
                        <span class="badge bg-secondary">Sem Capa</span>
                      }
                    </td>
                    <td>
                      <div class="fw-bold">{{ item.book.title }}</div>
                      <small class="text-muted">{{ item.book.author }}</small>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border">{{
                        item.subcategoryName
                      }}</span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex gap-2 justify-content-end align-items-center">
                        <button
                          class="btn btn-sm btn-outline-primary"
                          (click)="openEditBookModal(item)"
                          title="Editar"
                        >
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteBook(item)"
                          title="Excluir"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                      Nenhum livro encontrado com os filtros informados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Controles de Paginação -->
          @if (totalPages() > 1) {
            <nav
              class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-2"
            >
              <small class="text-muted">
                Mostrando página <strong>{{ currentPage() }}</strong> de
                <strong>{{ totalPages() }}</strong> (Total: {{ filteredBooksList().length }} livros)
              </small>

              <ul class="pagination pagination-sm m-0">
                <li class="page-item" [class.disabled]="currentPage() === 1">
                  <button class="page-link" (click)="changePage(currentPage() - 1)">
                    Anterior
                  </button>
                </li>

                @for (p of [].constructor(totalPages()); track $index) {
                  <li class="page-item" [class.active]="currentPage() === $index + 1">
                    <button class="page-link" (click)="changePage($index + 1)">
                      {{ $index + 1 }}
                    </button>
                  </li>
                }

                <li class="page-item" [class.disabled]="currentPage() === totalPages()">
                  <button class="page-link" (click)="changePage(currentPage() + 1)">Próxima</button>
                </li>
              </ul>
            </nav>
          }
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
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="catFormName"
                  name="catFormName"
                  placeholder="Ex: Farmácia"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Ícone Bootstrap Icons</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"
                    ><i [class]="'bi ' + (catFormIcon || 'bi-journal')"></i
                  ></span>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="catFormIcon"
                    name="catFormIcon"
                    placeholder="bi-capsule"
                  />
                </div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Gradiente de Fundo (CSS)</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="catFormGradient"
                  name="catFormGradient"
                  placeholder="linear-gradient(135deg, #0d6efd 0%, #002b66 100%)"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Imagem Ilustrativa (Opcional)</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="catFormImage"
                  name="catFormImage"
                  placeholder="assets/images/category.png"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Descrição</label>
              <textarea
                class="form-control"
                [(ngModel)]="catFormDescription"
                name="catFormDescription"
                rows="2"
                placeholder="Breve apresentação da área..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-success w-100 py-2 rounded-3 fw-bold"
              [disabled]="isSubmitting() || !catFormName"
            >
              <i class="bi bi-check2-circle me-1"></i>
              {{ editingCategoryId() ? 'Atualizar Categoria' : 'Cadastrar Categoria' }}
            </button>
          </form>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-bold mb-3 text-dark">
            Categorias Cadastradas ({{ fullCategories().length }})
          </h5>
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
                      <small class="text-muted text-truncate d-block" style="max-width: 320px;">{{
                        cat.description
                      }}</small>
                    </td>
                    <td><i [class]="'bi ' + cat.iconClass + ' fs-5 text-primary'"></i></td>
                    <td>
                      <span class="badge bg-secondary-subtle text-secondary border"
                        >{{ cat.subcategories ? cat.subcategories.length : 0 }} tópicos</span
                      >
                    </td>
                    <td class="text-end">
                      <div class="d-flex gap-2 justify-content-end align-items-center">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          (click)="startEditCategory(cat)"
                        >
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          (click)="deleteCategory(cat.id, cat.name)"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
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
                <select
                  class="form-select"
                  [(ngModel)]="subFormCategoryId"
                  name="subFormCategoryId"
                  [disabled]="!!editingSubcategoryId()"
                  required
                >
                  <option value="" disabled selected>Selecione a categoria</option>
                  @for (cat of fullCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Nome da Subcategoria *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="subFormName"
                  name="subFormName"
                  placeholder="Ex: Farmacologia Clínica"
                  required
                />
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Imagem Ilustrativa (Opcional)</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="subFormImage"
                  name="subFormImage"
                  placeholder="assets/images/subcategory/foto.png"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Descrição</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="subFormDescription"
                  name="subFormDescription"
                  placeholder="Breve resumo deste tópico..."
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-success w-100 py-2 rounded-3 fw-bold"
              [disabled]="isSubmitting() || !subFormCategoryId || !subFormName"
            >
              <i class="bi bi-check2-circle me-1"></i>
              {{ editingSubcategoryId() ? 'Atualizar Subcategoria' : 'Cadastrar Subcategoria' }}
            </button>
          </form>
        </div>

        <div class="card border-0 shadow-sm rounded-4 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold m-0 text-dark">Subcategorias Cadastradas</h5>
            <div style="min-width: 250px;">
              <select
                class="form-select form-select-sm"
                [(ngModel)]="filterCategoryId"
                name="filterCategoryId"
              >
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
                      <small class="text-muted text-truncate d-block" style="max-width: 280px;">{{
                        item.sub.description || 'Sem descrição'
                      }}</small>
                    </td>
                    <td>
                      <span
                        class="badge bg-primary-subtle text-primary border border-primary-subtle"
                        >{{ item.catName }}</span
                      >
                    </td>
                    <td>{{ item.sub.books ? item.sub.books.length : 0 }} livros</td>
                    <td class="text-end">
                      <div class="d-flex gap-2 justify-content-end align-items-center">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          (click)="startEditSubcategory(item.catId, item.sub)"
                        >
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          (click)="deleteSubcategory(item.catId, item.sub.id, item.sub.name)"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
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

    <!-- Modal de Edição de Livro com Suporte a Nível 3 -->
    @if (editingBookData()) {
      <div
        class="modal fade show d-block"
        tabindex="-1"
        style="background-color: rgba(0,0,0,0.65); z-index: 1050;"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                Editar Livro (ID: <code>{{ editingBookData()?.book?.id }}</code
                >)
              </h5>
              <button type="button" class="btn-close" (click)="editingBookData.set(null)"></button>
            </div>
            <div class="modal-body">
              <!-- Seletores para mover de Categoria/Subcategoria/Subtópico -->
              <div class="row g-2 mb-3 bg-light p-3 rounded-3 border">
                <div class="col-12">
                  <label class="form-label small fw-bold text-dark mb-1"
                    >Localização no Acervo</label
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted" style="font-size: 0.75rem;">Categoria</label>
                  <select
                    class="form-select form-select-sm"
                    [(ngModel)]="editingBookData()!.newCategoryId"
                    (change)="onEditCategoryChange()"
                  >
                    @for (cat of fullCategories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted" style="font-size: 0.75rem;"
                    >Subcategoria</label
                  >
                  <select
                    class="form-select form-select-sm"
                    [(ngModel)]="editingBookData()!.newSubcategoryId"
                    (change)="onEditSubcategoryChange()"
                  >
                    @for (sub of availableEditSubcategories(); track sub.id) {
                      <option [value]="sub.id">{{ sub.name }}</option>
                    }
                  </select>
                </div>

                @if (availableEditChildSubcategories().length > 0) {
                  <div class="col-12 mt-2">
                    <label class="form-label text-muted" style="font-size: 0.75rem;"
                      >Especialidade / Subtópico Específico</label
                    >
                    <select
                      class="form-select form-select-sm"
                      [(ngModel)]="editingBookData()!.newChildSubcategoryId"
                    >
                      <option value="">Geral / Nenhum específico</option>
                      @for (child of availableEditChildSubcategories(); track child.id) {
                        <option [value]="child.id">{{ child.name }}</option>
                      }
                    </select>
                  </div>
                }
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Título</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="editingBookData()!.book.title"
                />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Autor(es)</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="editingBookData()!.book.author"
                />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Drive File ID ou Link do Drive</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="editingBookData()!.book.driveFileId"
                  (input)="extractEditDriveId()"
                />
                <small class="text-muted">O sistema extrairá o ID correto automaticamente.</small>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">URL da Capa</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="editingBookData()!.book.coverUrl"
                />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Descrição / Resumo</label>
                <textarea
                  class="form-control"
                  rows="3"
                  [(ngModel)]="editingBookData()!.book.description"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary rounded-pill px-4"
                (click)="editingBookData.set(null)"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary rounded-pill px-4"
                (click)="saveEditedBook()"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminComponent implements OnInit {
  private categoryService = inject(CategoryService);

  currentTab = signal<'books' | 'manage-books' | 'categories' | 'subcategories'>('books');
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

  // --- GERENCIAR / FILTRAR LIVROS & PAGINAÇÃO ---
  manageFilterCategoryId = '';
  manageFilterSubcategoryId = '';
  manageFilterQuery = '';
  availableManageSubcategories = signal<Subcategory[]>([]);

  // Atualizado para suportar o 3º nível (subtópico específico) na edição
  editingBookData = signal<{
    oldCategoryId: string;
    oldSubcategoryId: string;
    newCategoryId: string;
    newSubcategoryId: string;
    newChildSubcategoryId: string;
    book: Book;
  } | null>(null);
  availableEditSubcategories = signal<Subcategory[]>([]);
  availableEditChildSubcategories = signal<Subcategory[]>([]);

  currentPage = signal<number>(1);
  pageSize = 10;

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
    this.categoryService.getFullCategories().subscribe({
      next: (data) => {
        this.fullCategories.set(data || []);
        if (this.bookCategoryId) {
          const active = (data || []).find((c) => c.id === this.bookCategoryId);
          this.availableBookSubcategories.set(active ? active.subcategories : []);
        }
        if (this.manageFilterCategoryId) {
          const activeManage = (data || []).find((c) => c.id === this.manageFilterCategoryId);
          this.availableManageSubcategories.set(activeManage ? activeManage.subcategories : []);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.errorMessage.set('Erro ao sincronizar dados com o servidor.');
      },
    });
  }

  setTab(tab: 'books' | 'manage-books' | 'categories' | 'subcategories') {
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
    const active = this.fullCategories().find((c) => c.id === this.bookCategoryId);
    this.availableBookSubcategories.set(active ? active.subcategories : []);
    this.availableBookChildSubcategories.set([]);
  }

  onBookSubcategoryChange() {
    this.bookChildSubcategoryId = '';
    const selected = this.availableBookSubcategories().find((s) => s.id === this.bookSubcategoryId);
    this.availableBookChildSubcategories.set(selected?.subcategories || []);
  }

  onManageCategoryChange() {
    this.manageFilterSubcategoryId = '';
    const active = this.fullCategories().find((c) => c.id === this.manageFilterCategoryId);
    this.availableManageSubcategories.set(active ? active.subcategories : []);
    this.currentPage.set(1);
  }

  extractDriveId() {
    const input = this.bookRawDriveInput.trim();
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);
    this.bookExtractedId.set(match && match[1] ? match[1] : input);
  }

  extractEditDriveId() {
    const data = this.editingBookData();
    if (!data || !data.book.driveFileId) return;

    const input = data.book.driveFileId.trim();
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
      data.book.driveFileId = match[1];
    }
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
      .map((k) => k.trim())
      .filter(Boolean);

    this.categoryService
      .addBook({
        categoryId: this.bookCategoryId,
        subcategoryId: this.bookSubcategoryId,
        childSubcategoryId: this.bookChildSubcategoryId || undefined,
        title: this.bookTitle,
        author: this.bookAuthor,
        description: this.bookDescription,
        pages: this.bookPages || undefined,
        coverUrl: this.bookCoverUrl || undefined,
        keywords: keywordsArray,
        driveFileId: this.bookExtractedId(),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set(`"${this.bookTitle}" cadastrado com sucesso!`);
          this.resetBookForm();
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Erro ao salvar livro: ' + (err.error?.message || err.message));
        },
      });
  }

  resetBookForm() {
    this.bookCategoryId = '';
    this.bookSubcategoryId = '';
    this.bookChildSubcategoryId = '';
    this.availableBookSubcategories.set([]);
    this.availableBookChildSubcategories.set([]);

    this.bookTitle = '';
    this.bookAuthor = '';
    this.bookDescription = '';
    this.bookPages = null;
    this.bookKeywordsInput = '';
    this.bookCoverUrl = '';
    this.bookRawDriveInput = '';
    this.bookExtractedId.set('');
  }

  // Listagem de livros para gerenciamento com suporte completo aos 3 níveis
  filteredBooksList(): {
    categoryId: string;
    subcategoryId: string;
    subcategoryName: string;
    book: Book;
  }[] {
    const list: {
      categoryId: string;
      subcategoryId: string;
      subcategoryName: string;
      book: Book;
    }[] = [];

    this.fullCategories().forEach((cat) => {
      if (this.manageFilterCategoryId && cat.id !== this.manageFilterCategoryId) return;

      (cat.subcategories || []).forEach((sub) => {
        const processBooks = (booksArray: any[], subName: string, subId: string) => {
          (booksArray || []).forEach((book) => {
            const q = this.manageFilterQuery.toLowerCase().trim();
            if (q) {
              const matchId = book.id?.toLowerCase().includes(q);
              const matchTitle = book.title?.toLowerCase().includes(q);
              const matchAuthor = book.author?.toLowerCase().includes(q);
              if (!matchId && !matchTitle && !matchAuthor) return;
            }

            list.push({
              categoryId: cat.id,
              subcategoryId: subId,
              subcategoryName: subName,
              book: { ...book },
            });
          });
        };

        const matchesSub =
          !this.manageFilterSubcategoryId || sub.id === this.manageFilterSubcategoryId;

        if (matchesSub) {
          processBooks(sub.books, sub.name, sub.id);
        }

        if (sub.subcategories && Array.isArray(sub.subcategories)) {
          sub.subcategories.forEach((child) => {
            const matchesChildSub =
              !this.manageFilterSubcategoryId || child.id === this.manageFilterSubcategoryId;

            if (matchesSub || matchesChildSub) {
              processBooks(child.books, child.name, child.id);
            }
          });
        }
      });
    });

    return list;
  }

  // Métodos de Paginação
  paginatedBooksList() {
    const allFiltered = this.filteredBooksList();
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return allFiltered.slice(startIndex, startIndex + this.pageSize);
  }

  totalPages(): number {
    const total = this.filteredBooksList().length;
    return Math.ceil(total / this.pageSize) || 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openEditBookModal(item: {
    categoryId: string;
    subcategoryId: string;
    subcategoryName: string;
    book: Book;
  }) {
    const cat = this.fullCategories().find((c) => c.id === item.categoryId);
    const subcategories = cat ? cat.subcategories : [];
    this.availableEditSubcategories.set(subcategories);

    let foundParentSubId = item.subcategoryId;
    let foundChildSubId = '';
    let childList: Subcategory[] = [];

    const directSub = subcategories.find((s) => s.id === item.subcategoryId);
    if (!directSub) {
      for (const sub of subcategories) {
        if (sub.subcategories && Array.isArray(sub.subcategories)) {
          const childMatch = sub.subcategories.find((c) => c.id === item.subcategoryId);
          if (childMatch) {
            foundParentSubId = sub.id;
            foundChildSubId = item.subcategoryId;
            childList = sub.subcategories;
            break;
          }
        }
      }
    } else {
      childList = directSub.subcategories || [];
    }

    this.availableEditChildSubcategories.set(childList);

    this.editingBookData.set({
      oldCategoryId: item.categoryId,
      oldSubcategoryId: item.subcategoryId,
      newCategoryId: item.categoryId,
      newSubcategoryId: foundParentSubId,
      newChildSubcategoryId: foundChildSubId,
      book: { ...item.book },
    });
  }

  onEditCategoryChange() {
    const data = this.editingBookData();
    if (!data) return;
    const cat = this.fullCategories().find((c) => c.id === data.newCategoryId);
    const subs = cat ? cat.subcategories : [];
    this.availableEditSubcategories.set(subs);

    data.newSubcategoryId = subs.length > 0 ? subs[0].id : '';
    this.onEditSubcategoryChange();
  }

  onEditSubcategoryChange() {
    const data = this.editingBookData();
    if (!data) return;
    const parentSub = this.availableEditSubcategories().find((s) => s.id === data.newSubcategoryId);
    const children = parentSub?.subcategories || [];
    this.availableEditChildSubcategories.set(children);
    data.newChildSubcategoryId = '';
  }

  saveEditedBook() {
    const data = this.editingBookData();
    if (!data) return;
    this.isSubmitting.set(true);

    const targetDestinationId = data.newChildSubcategoryId || data.newSubcategoryId;
    const isMoving =
      data.oldCategoryId !== data.newCategoryId || data.oldSubcategoryId !== targetDestinationId;

    if (isMoving) {
      this.categoryService
        .deleteBook(data.oldCategoryId, data.oldSubcategoryId, data.book.id)
        .subscribe({
          next: () => {
            this.categoryService
              .addBook({
                categoryId: data.newCategoryId,
                subcategoryId: data.newSubcategoryId,
                childSubcategoryId: data.newChildSubcategoryId || undefined,
                title: data.book.title,
                author: data.book.author,
                description: data.book.description,
                pages: data.book.pages,
                coverUrl: data.book.coverUrl,
                keywords: data.book.keywords || ['Acervo'],
                driveFileId: data.book.driveFileId,
              })
              .subscribe({
                next: () => {
                  this.isSubmitting.set(false);
                  this.successMessage.set('Livro movido e atualizado com sucesso!');
                  this.editingBookData.set(null);
                  this.loadData();
                },
                error: (err) => {
                  this.isSubmitting.set(false);
                  this.errorMessage.set(
                    'Erro ao adicionar livro no novo destino: ' +
                      (err.error?.message || err.message),
                  );
                },
              });
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              'Erro ao remover livro da origem: ' + (err.error?.message || err.message),
            );
          },
        });
    } else {
      this.categoryService
        .updateBook(data.oldCategoryId, data.oldSubcategoryId, data.book.id, data.book)
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.successMessage.set('Livro atualizado com sucesso!');
            this.editingBookData.set(null);
            this.loadData();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              'Erro ao atualizar livro: ' + (err.error?.message || err.message),
            );
          },
        });
    }
  }

  deleteBook(item: { categoryId: string; subcategoryId: string; book: Book }) {
    if (!confirm(`Deseja realmente excluir o livro "${item.book.title}" (ID: ${item.book.id})?`))
      return;

    this.categoryService.deleteBook(item.categoryId, item.subcategoryId, item.book.id).subscribe({
      next: () => {
        this.successMessage.set(`Livro "${item.book.title}" excluído.`);
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set('Erro ao excluir livro: ' + (err.error?.message || err.message));
      },
    });
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
      description: this.catFormDescription,
    };

    const request$ = this.editingCategoryId()
      ? this.categoryService.updateCategory(this.editingCategoryId()!, payload)
      : this.categoryService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(
          this.editingCategoryId()
            ? 'Categoria atualizada com sucesso!'
            : 'Categoria criada com sucesso!',
        );
        this.cancelCategoryEdit();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Erro ao salvar categoria: ' + (err.error?.message || err.message));
      },
    });
  }

  deleteCategory(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}" e todos os seus tópicos?`))
      return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage.set(`Categoria "${name}" excluída.`);
        this.loadData();
      },
      error: (err) =>
        this.errorMessage.set('Erro ao excluir categoria: ' + (err.error?.message || err.message)),
    });
  }

  // ==========================================
  // LÓGICA DE SUBCATEGORIAS
  // ==========================================
  filteredSubcategoriesList(): { catId: string; catName: string; sub: Subcategory }[] {
    const list: { catId: string; catName: string; sub: Subcategory }[] = [];
    const categories = this.filterCategoryId
      ? this.fullCategories().filter((c) => c.id === this.filterCategoryId)
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
      description: this.subFormDescription,
    };

    const request$ = this.editingSubcategoryId()
      ? this.categoryService.updateSubcategory(
          this.subFormCategoryId,
          this.editingSubcategoryId()!,
          payload,
        )
      : this.categoryService.createSubcategory(this.subFormCategoryId, payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(
          this.editingSubcategoryId()
            ? 'Subcategoria atualizada!'
            : 'Subcategoria criada com sucesso!',
        );
        this.cancelSubcategoryEdit();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          'Erro ao salvar subcategoria: ' + (err.error?.message || err.message),
        );
      },
    });
  }

  deleteSubcategory(catId: string, subId: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a subcategoria "${name}"?`)) return;
    this.categoryService.deleteSubcategory(catId, subId).subscribe({
      next: () => {
        this.successMessage.set(`Subcategoria "${name}" excluída.`);
        this.loadData();
      },
      error: (err) =>
        this.errorMessage.set(
          'Erro ao excluir subcategoria: ' + (err.error?.message || err.message),
        ),
    });
  }
}