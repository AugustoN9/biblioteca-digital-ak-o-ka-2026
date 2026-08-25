import { Router, Request, Response } from 'express';
import { CategoryModel } from '../models/category.schema';
import { Category, Subcategory, Book } from '../models/category.model';

const router = Router();

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ==========================================
// ROTAS DE BUSCA E LISTAGEM
// ==========================================

// GET /api/categories (Resumo para a Home)
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find({}, 'id slug name description iconClass gradientBackground imageUrl subcategories');
    const summary = categories.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      iconClass: cat.iconClass,
      gradientBackground: cat.gradientBackground,
      imageUrl: cat.imageUrl,
      subcategoriesCount: cat.subcategories ? cat.subcategories.length : 0
    }));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categorias no banco', error });
  }
});

// GET /api/categories/all/full (Árvore completa para o Admin)
router.get('/all/full', async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados completos', error });
  }
});

// GET /api/categories/search/query?q=termo (Busca Global)
router.get('/search/query', async (req: Request, res: Response) => {
  try {
    const q = (req.query['q'] as string || '').toLowerCase().trim();
    if (!q) return res.json([]);

    const categories = await CategoryModel.find();
    const results: any[] = [];

    const searchInBooks = (books: Book[], cat: any, sub: any) => {
      for (const book of books) {
        const titleMatch = book.title?.toLowerCase().includes(q);
        const authorMatch = book.author?.toLowerCase().includes(q);
        const descMatch = book.description?.toLowerCase().includes(q);
        const catMatch = cat.name.toLowerCase().includes(q);
        const subMatch = sub.name.toLowerCase().includes(q);
        const keywordMatch = book.keywords?.some(k => k.toLowerCase().includes(q));

        if (titleMatch || authorMatch || descMatch || catMatch || subMatch || keywordMatch) {
          results.push({
            ...book.toObject ? book.toObject() : book,
            categoryName: cat.name,
            categorySlug: cat.slug,
            subcategoryName: sub.name,
            subcategorySlug: sub.slug
          });
        }
      }
    };

    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        searchInBooks(sub.books, cat, sub);
        if (sub.subcategories) {
          for (const child of sub.subcategories) {
            searchInBooks(child.books, cat, child);
          }
        }
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao pesquisar livros', error });
  }
});

// GET /api/categories/:slug (Detalhes da Categoria)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await CategoryModel.findOne({ slug });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categoria', error });
  }
});

// ==========================================
// CRUD DE CATEGORIAS
// ==========================================

// POST /api/categories (Criar)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, iconClass, gradientBackground, imageUrl } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });

    const slug = generateSlug(name);
    const existing = await CategoryModel.findOne({ $or: [{ id: slug }, { slug }] });
    if (existing) {
      return res.status(400).json({ message: 'Já existe uma categoria com este nome.' });
    }

    const newCategory = await CategoryModel.create({
      id: slug,
      slug,
      name,
      description: description || '',
      iconClass: iconClass || 'bi-journal-bookmark-fill',
      gradientBackground: gradientBackground || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      imageUrl: imageUrl || undefined,
      subcategories: []
    });

    res.status(201).json({ message: 'Categoria criada com sucesso!', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar categoria', error });
  }
});

// PUT /api/categories/:id (Atualizar)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, iconClass, gradientBackground, imageUrl } = req.body;

    const category = await CategoryModel.findOne({ id });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    category.name = name || category.name;
    if (name) category.slug = generateSlug(name);
    if (description !== undefined) category.description = description;
    if (iconClass) category.iconClass = iconClass;
    if (gradientBackground) category.gradientBackground = gradientBackground;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;

    await category.save();
    res.json({ message: 'Categoria atualizada com sucesso!', category });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar categoria', error });
  }
});

// DELETE /api/categories/:id (Excluir)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await CategoryModel.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Categoria não encontrada.' });

    res.json({ message: 'Categoria excluída com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir categoria', error });
  }
});

// ==========================================
// CRUD DE SUBCATEGORIAS
// ==========================================

// POST /api/categories/:categoryId/subcategories
router.post('/:categoryId/subcategories', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { name, description, imageUrl } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome da subcategoria é obrigatório.' });

    const category = await CategoryModel.findOne({ id: categoryId });
    if (!category) return res.status(404).json({ message: 'Categoria pai não encontrada.' });

    const slug = generateSlug(name);
    const newSubcategory = {
      id: `${categoryId}-${slug}`,
      slug,
      name,
      description: description || '',
      imageUrl: imageUrl || undefined,
      books: []
    };

    category.subcategories.push(newSubcategory as any);
    await category.save();

    res.status(201).json({ message: 'Subcategoria criada com sucesso!', subcategory: newSubcategory });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar subcategoria', error });
  }
});

// PUT /api/categories/:categoryId/subcategories/:subId
router.put('/:categoryId/subcategories/:subId', async (req: Request, res: Response) => {
  try {
    const { categoryId, subId } = req.params;
    const { name, description, imageUrl } = req.body;

    const category = await CategoryModel.findOne({ id: categoryId });
    if (!category) return res.status(404).json({ message: 'Categoria pai não encontrada.' });

    const subcategory = (category.subcategories as any).id
      ? category.subcategories.find((s: any) => s.id === subId)
      : category.subcategories.find((s: any) => s.id === subId);

    if (!subcategory) return res.status(404).json({ message: 'Subcategoria não encontrada.' });

    subcategory.name = name || subcategory.name;
    if (name) subcategory.slug = generateSlug(name);
    if (description !== undefined) subcategory.description = description;
    if (imageUrl !== undefined) subcategory.imageUrl = imageUrl;

    await category.save();
    res.json({ message: 'Subcategoria atualizada com sucesso!', subcategory });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar subcategoria', error });
  }
});

// DELETE /api/categories/:categoryId/subcategories/:subId
router.delete('/:categoryId/subcategories/:subId', async (req: Request, res: Response) => {
  try {
    const { categoryId, subId } = req.params;
    const category = await CategoryModel.findOne({ id: categoryId });
    if (!category) return res.status(404).json({ message: 'Categoria pai não encontrada.' });

    category.subcategories = category.subcategories.filter((s: any) => s.id !== subId);
    await category.save();

    res.json({ message: 'Subcategoria excluída com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir subcategoria', error });
  }
});

// ==========================================
// CADASTRO DE LIVROS E FAVORITOS
// ==========================================

// POST /api/categories/books
router.post('/books', async (req: Request, res: Response) => {
  try {
    const { categoryId, subcategoryId, childSubcategoryId, title, author, description, driveFileId, pages, coverUrl, keywords } = req.body;

    if (!categoryId || !subcategoryId || !title || !driveFileId) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    const category = await CategoryModel.findOne({ id: categoryId });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada.' });

    const subcategory = category.subcategories.find((s: any) => s.id === subcategoryId);
    if (!subcategory) return res.status(404).json({ message: 'Subcategoria não encontrada.' });

    const newBook: Book = {
      id: 'book_' + Date.now(),
      title,
      author: author || 'Autor Desconhecido',
      description: description || '',
      driveFileId,
      pages: pages ? Number(pages) : undefined,
      coverUrl: coverUrl || undefined,
      keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []),
      likes: 0
    };

    if (childSubcategoryId && subcategory.subcategories) {
      const childSub = subcategory.subcategories.find((cs: any) => cs.id === childSubcategoryId);
      if (childSub) {
        childSub.books.push(newBook as any);
      } else {
        subcategory.books.push(newBook as any);
      }
    } else {
      subcategory.books.push(newBook as any);
    }

    await category.save();
    res.status(201).json({ message: 'Livro cadastrado com sucesso!', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar o livro', error });
  }
});

// POST /api/categories/books/:bookId/like
router.post('/books/:bookId/like', async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const categories = await CategoryModel.find();
    let updatedLikes = 0;
    let foundCategory: any = null;

    const findAndLike = (booksList: any[]) => {
      const book = booksList.find((b: any) => b.id === bookId);
      if (book) {
        book.likes = (book.likes || 0) + 1;
        updatedLikes = book.likes;
        return true;
      }
      return false;
    };

    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        if (findAndLike(sub.books)) {
          foundCategory = cat;
          break;
        }
        if (sub.subcategories) {
          for (const child of sub.subcategories) {
            if (findAndLike(child.books)) {
              foundCategory = cat;
              break;
            }
          }
        }
      }
      if (foundCategory) break;
    }

    if (foundCategory) {
      await foundCategory.save();
      return res.json({ likes: updatedLikes });
    }

    return res.status(404).json({ message: 'Livro não encontrado' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao favoritar', error });
  }
});

export default router;