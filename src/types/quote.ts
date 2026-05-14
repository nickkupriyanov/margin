export type Quote = {
  id: string;
  text: string;
  author: string;
  source: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type QuoteDraft = {
  text: string;
  author?: string;
  source?: string;
  tags?: string[];
};

export type WidgetPreference = 'random' | 'favorites';

export type WidgetSnapshot = {
  quoteId: string;
  text: string;
  author: string;
  source: string;
  accentStyle: 'paper' | 'sepia' | 'evening';
  updatedAt: string;
};
