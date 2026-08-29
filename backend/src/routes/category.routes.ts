import { Router } from 'express';
import Category from '../models/category.schema.js';
import User from '../models/user.schema.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// ============================================================================
// 1. ROTAS ESPECÍFICAS / ESTÁTICAS (DEVEM VIR SEMPRE ANTES DE /:slug OU /:id)
// ============================================================================

// GET /api/categories/stats/total-books - Retorna o total geral de livros considerando os 3 níveis
router.get('/stats/total-books', async (req, res) => {
  try {
    const categories = await Category.find({});
    let totalBooks = 0;

    categories.forEach((cat: any) => {
      (cat.subcategories || []).forEach((sub: any) => {
        // Nível 2 (Livros diretos da subcategoria)
        totalBooks += (sub.books || []).length;

        // Nível 3 (Subcategorias filhas)
        (sub.subcategories || []).forEach((child: any) => {
          totalBooks += (child.books || []).length;
        });
      });
    });

    return res.json({ totalBooks });
  } catch (error: any) {
    console.error('Erro ao calcular total de livros:', error);
    return res.status(500).json({ message: 'Erro ao calcular total de livros', error: error.message });
  }
});

// GET /api/categories/books/top-liked
router.get('/books/top-liked', async (req, res) => {
  try {
    const categories = await Category.find({});
    const allBooks: any[] = [];

    categories.forEach((cat: any) => {
      (cat.subcategories || []).forEach((sub: any) => {
        // Nível 2
        (sub.books || []).forEach((b: any) => {
          const bookData = b.toObject ? b.toObject() : b;
          allBooks.push({
            ...bookData,
            likes: bookData.likes || 0,
            categoryName: cat.name,
            categorySlug: cat.slug,
            subcategoryName: sub.name,
            subcategorySlug: sub.slug
          });
        });

        // Nível 3 (filhas)
        (sub.subcategories || []).forEach((child: any) => {
          (child.books || []).forEach((b: any) => {
            const bookData = b.toObject ? b.toObject() : b;
            allBooks.push({
              ...bookData,
              likes: bookData.likes || 0,
              categoryName: cat.name,
              categorySlug: cat.slug,
              subcategoryName: child.name,
              subcategorySlug: child.slug
            });
          });
        });
      });
    });

    const topBooks = allBooks
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);

    return res.json(topBooks);
  } catch (error: any) {
    console.error('Erro na rota top-liked:', error);
    return res.status(500).json({ error: 'Erro ao buscar livros mais curtidos.' });
  }
});

// GET /api/categories/books/search (Busca Global com suporte a ID)
router.get('/books/search', async (req, res) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json([]);
    }

    const categories = await Category.find({});
    const results: any[] = [];

    categories.forEach((cat: any) => {
      (cat.subcategories || []).forEach((sub: any) => {
        // Nível 2
        (sub.books || []).forEach((book: any) => {
          const idMatch = book.id?.toLowerCase().includes(q);
          const titleMatch = book.title?.toLowerCase().includes(q);
          const authorMatch = book.author?.toLowerCase().includes(q);
          const descMatch = book.description?.toLowerCase().includes(q);
          const tagMatch = (book.keywords || []).some((k: string) => k.toLowerCase().includes(q));

          if (idMatch || titleMatch || authorMatch || descMatch || tagMatch) {
            const bookData = book.toObject ? book.toObject() : book;
            results.push({
              ...bookData,
              categoryId: cat.id,
              subcategoryId: sub.id,
              categorySlug: cat.slug,
              categoryName: cat.name,
              subcategorySlug: sub.slug,
              subcategoryName: sub.name
            });
          }
        });
      });
    });

    return res.json(results);
  } catch (error: any) {
    console.error('Erro na rota de busca:', error);
    return res.status(500).json({ message: 'Erro na busca global', error: error.message });
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
    return res.json({ success: true, likes: updatedLikes });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao registrar like', error: error.message });
  }
});

// ============================================================================
// 2. ROTAS GERAIS E DINÂMICAS POR SLUG
// ============================================================================

// Obter todas as categorias com subcategorias e livros
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
});

// Obter categoria por slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    return res.json(category);
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao buscar categoria', error: error.message });
  }
});

// ============================================================================
// 3. OPERAÇÕES ADMINISTRATIVAS (PROTEGIDAS POR JWT)
// ============================================================================

// Criar nova categoria
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const saved = await newCategory.save();
    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao criar categoria', error: error.message });
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
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao atualizar categoria', error: error.message });
  }
});

// Deletar categoria
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    return res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao deletar categoria', error: error.message });
  }
});

// Adicionar subcategoria
router.post('/:categoryId/subcategories', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    category.subcategories.push(req.body);
    await category.save();
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao adicionar subcategoria', error: error.message });
  }
});

// Atualizar subcategoria
router.put('/:categoryId/subcategories/:subId', authMiddleware, async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const category = await Category.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const subIndex = category.subcategories.findIndex((s: any) => s.id === subId);
    if (subIndex === -1) {
      return res.status(404).json({ message: 'Subcategoria não encontrada' });
    }

    category.subcategories[subIndex] = { ...category.subcategories[subIndex].toObject(), ...req.body };
    await category.save();
    return res.json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao atualizar subcategoria', error: error.message });
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
    return res.json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao deletar subcategoria', error: error.message });
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
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao adicionar livro', error: error.message });
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
    return res.json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao atualizar livro', error: error.message });
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
    return res.json(category);
  } catch (error: any) {
    return res.status(400).json({ message: 'Erro ao deletar livro', error: error.message });
  }
});

// Registrar download de livro (Controlando limite de 5 a cada 24h e incrementando contador)
router.post('/books/:bookId/download', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.bookId as string;
    const userId = (req as any).user.id; // Obtido do token JWT

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Filtrar downloads das últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    user.downloadHistory = user.downloadHistory.filter(
      (record) => new Date(record.timestamp) > twentyFourHoursAgo
    );

    if (user.downloadHistory.length >= 5) {
      return res.status(429).json({
        message: 'Limite diário de downloads atingido (máximo de 5 livros a cada 24 horas).'
      });
    }

    // Encontrar o livro no banco de categorias para incrementar downloadsCount
    const category = await Category.findOne({ 'subcategories.books.id': bookId });
    if (!category) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }

    let bookFound = false;
    category.subcategories.forEach((sub: any) => {
      const book = sub.books.find((b: any) => b.id === bookId);
      if (book) {
        book.downloadsCount = (book.downloadsCount || 0) + 1;
        bookFound = true;
      }
    });

    if (bookFound) {
      await category.save();
    }

    // Adicionar novo registro no histórico do usuário
    user.downloadHistory.push({ bookId, timestamp: new Date() });
    await user.save();

    return res.json({
      success: true,
      downloadsRemaining: 5 - user.downloadHistory.length
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao processar download', error: error.message });
  }
});

export default router;