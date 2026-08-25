import { Router } from 'express';
import Category from '../models/category.schema.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Obter todas as categorias com subcategorias e livros
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
});

// Obter categoria por slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar categoria', error: error.message });
  }
});

// Buscar livros globalmente por texto
router.get('/books/search', async (req, res) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json([]);
    }

    const categories = await Category.find();
    const results: any[] = [];

    categories.forEach((cat: any) => {
      (cat.subcategories || []).forEach((sub: any) => {
        (sub.books || []).forEach((book: any) => {
          const titleMatch = book.title?.toLowerCase().includes(q);
          const authorMatch = book.author?.toLowerCase().includes(q);
          const descMatch = book.description?.toLowerCase().includes(q);
          const tagMatch = (book.keywords || []).some((k: string) => k.toLowerCase().includes(q));

          if (titleMatch || authorMatch || descMatch || tagMatch) {
            const bookData = (book as any).toObject ? (book as any).toObject() : book;
            results.push({
              ...bookData,
              categorySlug: cat.slug,
              categoryName: cat.name,
              subcategorySlug: sub.slug,
              subcategoryName: sub.name
            });
          }
        });
      });
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro na busca global', error: error.message });
  }
});

// Incrementar like/favorito de um livro
router.post('/books/:bookId/like', async (req, res) => {
  try {
    const { bookId } = req.params;
    const category = await Category.findOne({ 'subcategories.books.id': bookId });

    if (!category) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    let updatedLikes = 0;
    category.subcategories.forEach((sub: any) => {
      const book = sub.books.find((b: any) => b.id === bookId);
      if (book) {
        book.likes = (book.likes || 0) + 1;
        updatedLikes = book.likes;
      }
    });

    await category.save();
    res.json({ success: true, likes: updatedLikes });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao registrar like', error: error.message });
  }
});

// Criar nova categoria (Protegido por JWT)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao criar categoria', error: error.message });
  }
});

// Atualizar categoria
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao atualizar categoria', error: error.message });
  }
});

// Adicionar subcategoria a uma categoria
router.post('/:categoryId/subcategories', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    category.subcategories.push(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao adicionar subcategoria', error: error.message });
  }
});

// Adicionar livro a uma subcategoria
router.post('/:categoryId/subcategories/:subcategoryId/books', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await Category.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const sub = category.subcategories.find((s: any) => s.id === subcategoryId);
    if (!sub) {
      return res.status(404).json({ message: 'Subcategoria não encontrada' });
    }

    sub.books.push(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao adicionar livro', error: error.message });
  }
});

// Atualizar livro
router.put('/:categoryId/subcategories/:subcategoryId/books/:bookId', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subcategoryId, bookId } = req.params;
    const category = await Category.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const sub = category.subcategories.find((s: any) => s.id === subcategoryId);
    if (!sub) {
      return res.status(404).json({ message: 'Subcategoria não encontrada' });
    }

    const bookIndex = sub.books.findIndex((b: any) => b.id === bookId);
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    sub.books[bookIndex] = { ...sub.books[bookIndex], ...req.body };
    await category.save();
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao atualizar livro', error: error.message });
  }
});

// Deletar livro
router.delete('/:categoryId/subcategories/:subcategoryId/books/:bookId', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subcategoryId, bookId } = req.params;
    const category = await Category.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const sub = category.subcategories.find((s: any) => s.id === subcategoryId);
    if (!sub) {
      return res.status(404).json({ message: 'Subcategoria não encontrada' });
    }

    (sub.books as any) = sub.books.filter((b: any) => b.id !== bookId);
    await category.save();
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao deletar livro', error: error.message });
  }
});

// Deletar subcategoria
router.delete('/:categoryId/subcategories/:subId', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const category = await Category.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    (category.subcategories as any) = category.subcategories.filter((s: any) => s.id !== subId);
    await category.save();
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao deletar subcategoria', error: error.message });
  }
});

export default router;