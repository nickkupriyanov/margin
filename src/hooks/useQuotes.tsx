import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackQuote } from '../data/fallbackQuote';
import {
  deleteQuoteRecord,
  initializeDatabase,
  insertQuote,
  listQuotes,
  toggleFavoriteRecord,
  updateQuoteRecord,
} from '../storage/database';
import { getWidgetPreference } from '../storage/settings';
import { Quote, QuoteDraft, WidgetPreference } from '../types/quote';
import { buildWidgetSnapshot, publishWidgetSnapshot } from '../widgets/widgetSnapshot';

type QuotesContextValue = {
  quotes: Quote[];
  featuredQuote: Quote;
  addQuote: (draft: QuoteDraft) => Promise<void>;
  updateQuote: (id: string, patch: QuoteDraft) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  chooseRandomQuote: () => void;
  syncWidget: (preference?: WidgetPreference) => Promise<void>;
};

const QuotesContext = createContext<QuotesContextValue | null>(null);

export function QuotesProvider({ children }: PropsWithChildren) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await listQuotes();
    setQuotes(next);
    return next;
  }, []);

  const syncWidgetWithQuotes = useCallback(async (nextQuotes: Quote[], preference = getWidgetPreference()) => {
    const snapshot = buildWidgetSnapshot(nextQuotes, preference);
    await publishWidgetSnapshot(snapshot);
  }, []);

  const syncWidget = useCallback(async (preference?: WidgetPreference) => {
    await syncWidgetWithQuotes(quotes, preference ?? getWidgetPreference());
  }, [quotes, syncWidgetWithQuotes]);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      await initializeDatabase();
      const next = await listQuotes();
      if (!mounted) return;
      setQuotes(next);
      await syncWidgetWithQuotes(next);
    }
    boot();
    return () => {
      mounted = false;
    };
  }, [syncWidgetWithQuotes]);

  const featuredQuote = useMemo(() => {
    if (!quotes.length) return fallbackQuote;
    return quotes.find((quote) => quote.id === featuredId) ?? quotes[0];
  }, [featuredId, quotes]);

  const chooseRandomQuote = useCallback(() => {
    if (!quotes.length) return;
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setFeaturedId(random.id);
  }, [quotes]);

  const addQuote = useCallback(async (draft: QuoteDraft) => {
    const quote = await insertQuote(draft);
    const next = await refresh();
    setFeaturedId(quote.id);
    await syncWidgetWithQuotes(next);
  }, [refresh, syncWidgetWithQuotes]);

  const updateQuote = useCallback(async (id: string, patch: QuoteDraft) => {
    await updateQuoteRecord(id, patch);
    const next = await refresh();
    await syncWidgetWithQuotes(next);
  }, [refresh, syncWidgetWithQuotes]);

  const deleteQuote = useCallback(async (id: string) => {
    await deleteQuoteRecord(id);
    const next = await refresh();
    if (featuredId === id) setFeaturedId(next[0]?.id ?? null);
    await syncWidgetWithQuotes(next);
  }, [featuredId, refresh, syncWidgetWithQuotes]);

  const toggleFavorite = useCallback(async (id: string) => {
    await toggleFavoriteRecord(id);
    const next = await refresh();
    await syncWidgetWithQuotes(next);
  }, [refresh, syncWidgetWithQuotes]);

  const value = useMemo<QuotesContextValue>(() => ({
    quotes,
    featuredQuote,
    addQuote,
    updateQuote,
    deleteQuote,
    toggleFavorite,
    chooseRandomQuote,
    syncWidget,
  }), [addQuote, chooseRandomQuote, deleteQuote, featuredQuote, quotes, syncWidget, toggleFavorite, updateQuote]);

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used inside QuotesProvider');
  }
  return context;
}
