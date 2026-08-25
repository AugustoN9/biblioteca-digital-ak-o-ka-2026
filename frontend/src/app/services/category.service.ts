import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategorySummary, Subcategory, Book, SearchBookResult } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  //private apiUrl = 'http://localhost:3000/api/categories';
  private apiUrl = 'https://biblioteca-digital-ak-o-ka-2026.onrender.com/api/categories';

  getCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(this.apiUrl);
  }

  getFullCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/all/full`);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${slug}`);
  }

  searchBooks(query: string): Observable<SearchBookResult[]> {
    return this.http.get<SearchBookResult[]>(`${this.apiUrl}/search/query`, {
      params: { q: query }
    });
  }

  createCategory(data: Partial<Category>): Observable<{ message: string; category: Category }> {
    return this.http.post<{ message: string; category: Category }>(this.apiUrl, data);
  }

  updateCategory(id: string, data: Partial<Category>): Observable<{ message: string; category: Category }> {
    return this.http.put<{ message: string; category: Category }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  createSubcategory(categoryId: string, data: Partial<Subcategory>): Observable<{ message: string; subcategory: Subcategory }> {
    return this.http.post<{ message: string; subcategory: Subcategory }>(`${this.apiUrl}/${categoryId}/subcategories`, data);
  }

  updateSubcategory(categoryId: string, subId: string, data: Partial<Subcategory>): Observable<{ message: string; subcategory: Subcategory }> {
    return this.http.put<{ message: string; subcategory: Subcategory }>(`${this.apiUrl}/${categoryId}/subcategories/${subId}`, data);
  }

  deleteSubcategory(categoryId: string, subId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${categoryId}/subcategories/${subId}`);
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
  }): Observable<{ message: string; book: Book }> {
    return this.http.post<{ message: string; book: Book }>(`${this.apiUrl}/books`, bookData);
  }

  likeBook(bookId: string): Observable<{ likes: number }> {
    return this.http.post<{ likes: number }>(`${this.apiUrl}/books/${bookId}/like`, {});
  }
}