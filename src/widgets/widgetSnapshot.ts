import { NativeModules, Platform } from 'react-native';
import { fallbackQuote } from '../data/fallbackQuote';
import { Quote, WidgetPreference, WidgetSnapshot } from '../types/quote';

const MAX_WIDGET_TEXT_LENGTH = 185;

type CozyWidgetBridge = {
  writeSnapshot?: (json: string) => Promise<boolean>;
};

const bridge = NativeModules.CozyWidgetBridge as CozyWidgetBridge | undefined;

export function buildWidgetSnapshot(quotes: Quote[], preference: WidgetPreference): WidgetSnapshot {
  const pool = preference === 'favorites' ? quotes.filter((quote) => quote.isFavorite) : quotes;
  const sourcePool = pool.length ? pool : quotes;
  const quote = sourcePool.length ? sourcePool[Math.floor(Math.random() * sourcePool.length)] : fallbackQuote;

  return {
    quoteId: quote.id,
    text: truncateForWidget(quote.text),
    author: quote.author || 'Unknown',
    source: quote.source,
    accentStyle: preference === 'favorites' ? 'sepia' : 'paper',
    updatedAt: new Date().toISOString(),
  };
}

export async function publishWidgetSnapshot(snapshot: WidgetSnapshot) {
  if (Platform.OS !== 'ios' || !bridge?.writeSnapshot) {
    return false;
  }
  return bridge.writeSnapshot(JSON.stringify(snapshot));
}

function truncateForWidget(text: string) {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= MAX_WIDGET_TEXT_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_WIDGET_TEXT_LENGTH - 1).trim()}...`;
}
