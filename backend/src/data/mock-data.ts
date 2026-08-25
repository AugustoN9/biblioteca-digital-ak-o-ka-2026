import { Category } from '../models/category.model';

export const CATEGORIES_DATA: Category[] = [
  {
    id: '1',
    slug: 'livros-de-biologia',
    name: 'Livros de Biologia',
    description: 'Reunimos livros grátis de biologia em PDF cobrindo genética, microbiologia, evolução e ecologia.',
    iconClass: 'bi-bezier2',
    gradientBackground: 'linear-gradient(135deg, #0d5c2c 0%, #063116 100%)',
    subcategories: [
      {
        id: '101',
        slug: 'microbiologia-e-genetica',
        name: 'Microbiologia e Genética',
        description: 'Materiais didáticos e artigos fundamentais sobre ciências biológicas.',
        books: [
          {
            id: 'b1',
            title: 'Livro de Demonstração - Biologia',
            author: 'Autor de Exemplo',
            description: 'Apostila e material de consulta em PDF integrado ao Google Drive.',
            driveFileId: '1TvaYJ3vUOOZkwVTUlhn4mzvAcv-h6zi9',
            pages: 120
          }
        ]
      }
    ]
  },
  {
    id: '2',
    slug: 'contos-curtos',
    name: 'Contos Curtos',
    description: 'Mergulhe em um mundo de histórias breves, crônicas e narrativas emocionantes.',
    iconClass: 'bi-pencil-fill',
    gradientBackground: 'linear-gradient(135deg, #7b1fa2 0%, #2e0854 100%)',
    subcategories: []
  },
  {
    id: '3',
    slug: 'livros-infantis',
    name: 'Livros Infantis',
    description: 'Mergulhe em um mundo de fantasia e aprendizado com coleções educativas.',
    iconClass: 'bi-emoji-smile',
    gradientBackground: 'linear-gradient(135deg, #b25800 0%, #4a2400 100%)',
    subcategories: []
  },
  {
    id: '4',
    slug: 'livros-de-arte-e-fotografia',
    name: 'Livros de Arte e Fotografia',
    description: 'Técnicas de iluminação, composição visual, história da arte e ensaios fotográficos.',
    iconClass: 'bi-camera-fill',
    gradientBackground: 'linear-gradient(135deg, #5c0d38 0%, #2e061c 100%)',
    subcategories: []
  }
];