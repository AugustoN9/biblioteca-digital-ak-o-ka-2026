import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, CategorySummary, Subcategory, Book, SearchBookResult } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  //private apiUrl = 'http://localhost:3000/api/categories';
  private apiUrl = 'https://biblioteca-digital-ak-o-ka-2026.onrender.com/api/categories';

  private getAuthHeaders(): HttpHeaders {
    // Obtém o token salvo pelo AuthService ('admin_token')
    const token = this.authService.getToken() || localStorage.getItem('admin_token') || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getCategories(): Observable<CategorySummary[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      map((categories) =>
        categories.map((cat) => ({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          gradientBackground: cat.gradientBackground,
          imageUrl: cat.imageUrl,
          iconClass: cat.iconClass,
          subcategoriesCount: cat.subcategories ? cat.subcategories.length : 0
        }))
      )
    );
  }

  getFullCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getTopLikedBooks(): Observable<SearchBookResult[]> {
    return this.http.get<SearchBookResult[]>(`${this.apiUrl}/books/top-liked`);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${slug}`);
  }

  searchBooks(query: string): Observable<SearchBookResult[]> {
    return this.http.get<SearchBookResult[]>(`${this.apiUrl}/books/search`, {
      params: { q: query }
    });
  }

  createCategory(data: Partial<Category>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: string, data: Partial<Category>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createSubcategory(categoryId: string, data: Partial<Subcategory>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${categoryId}/subcategories`, data, { headers: this.getAuthHeaders() });
  }

  updateSubcategory(categoryId: string, subId: string, data: Partial<Subcategory>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${categoryId}/subcategories/${subId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteSubcategory(categoryId: string, subId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}/subcategories/${subId}`, { headers: this.getAuthHeaders() });
  }

  addBook(bookData: {
    categoryId: string;
    subcategoryId: string;
    childSubcategoryId?: string;
    title: string;
    author: string;
    description: string;
    driveFileId: string;
    pages?: number;
    coverUrl?: string;
    keywords?: string[];
  }): Observable<any> {
    const targetSubId = bookData.childSubcategoryId || bookData.subcategoryId;
    const payload = {
      id: 'book-' + Date.now(),
      title: bookData.title,
      author: bookData.author || 'Autor Desconhecido',
      description: bookData.description || '',
      driveFileId: bookData.driveFileId,
      pages: bookData.pages,
      coverUrl: bookData.coverUrl,
      keywords: bookData.keywords || [],
      likes: 0
    };

    return this.http.post<any>(
      `${this.apiUrl}/${bookData.categoryId}/subcategories/${targetSubId}/books`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  likeBook(bookId: string): Observable<{ success: boolean; likes: number }> {
    return this.http.post<{ success: boolean; likes: number }>(`${this.apiUrl}/books/${bookId}/like`, {});
  }
}