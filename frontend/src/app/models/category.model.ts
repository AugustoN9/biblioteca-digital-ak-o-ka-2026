export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  driveFileId: string;
  pages?: number;
  coverUrl?: string;
  likes?: number;
  keywords?: string[];
}

export interface SearchBookResult extends Book {
  categoryName: string;
  categorySlug: string;
  subcategoryName: string;
  subcategorySlug: string;
}

export interface Subcategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  books: Book[];
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  gradientBackground: string;
  imageUrl?: string;
  iconClass: string;
  subcategories: Subcategory[];
}

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  gradientBackground: string;
  imageUrl?: string;
  iconClass: string;
  subcategoriesCount: number;
  totalBooks?: number;
}