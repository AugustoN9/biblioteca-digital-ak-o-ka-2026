import mongoose, { Schema } from 'mongoose';

// Schema do Livro
const BookSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, default: 'Autor Desconhecido' },
  description: { type: String, default: '' },
  driveFileId: { type: String, required: true },
  pages: { type: Number },
  coverUrl: { type: String },
  likes: { type: Number, default: 0 },
  keywords: [{ type: String }]
});

// Schema da Subcategoria (com suporte a aninhamento recursivo de 3º nível)
const SubcategorySchema = new Schema({
  id: { type: String, required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String },
  books: [BookSchema],
  subcategories: [new Schema({
    id: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String },
    books: [BookSchema]
  })]
});

// Schema da Categoria Principal
const CategorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  iconClass: { type: String, default: 'bi-journal-bookmark-fill' },
  gradientBackground: { type: String, default: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
  imageUrl: { type: String },
  subcategories: [SubcategorySchema]
}, {
  timestamps: true
});

export const Category = mongoose.model('Category', CategorySchema);
export const CategoryModel = Category;
export default Category;