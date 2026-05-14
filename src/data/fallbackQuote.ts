import { Quote } from '../types/quote';

export const fallbackQuote: Quote = {
  id: 'fallback',
  text: 'Collect the lines that make the day feel wider.',
  author: 'Cozy Quotes',
  source: 'A quiet beginning',
  tags: [],
  isFavorite: false,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};
