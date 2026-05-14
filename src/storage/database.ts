import * as SQLite from 'expo-sqlite';
import { Quote, QuoteDraft } from '../types/quote';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('cozy-quotes.db');
  }
  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY NOT NULL,
      text TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      isFavorite INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}

export async function listQuotes(): Promise<Quote[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<QuoteRow>('SELECT * FROM quotes ORDER BY updatedAt DESC;');
  return rows.map(rowToQuote);
}

export async function insertQuote(draft: QuoteDraft): Promise<Quote> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const quote: Quote = {
    id: createId(),
    text: draft.text,
    author: draft.author ?? '',
    source: draft.source ?? '',
    tags: draft.tags ?? [],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    'INSERT INTO quotes (id, text, author, source, tags, isFavorite, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    quote.id,
    quote.text,
    quote.author,
    quote.source,
    JSON.stringify(quote.tags),
    quote.isFavorite ? 1 : 0,
    quote.createdAt,
    quote.updatedAt,
  );

  return quote;
}

export async function updateQuoteRecord(id: string, patch: Partial<QuoteDraft>): Promise<void> {
  const current = (await listQuotes()).find((quote) => quote.id === id);
  if (!current) return;
  const next = {
    text: patch.text ?? current.text,
    author: patch.author ?? current.author,
    source: patch.source ?? current.source,
    tags: patch.tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  };
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE quotes SET text = ?, author = ?, source = ?, tags = ?, updatedAt = ? WHERE id = ?;',
    next.text,
    next.author,
    next.source,
    JSON.stringify(next.tags),
    next.updatedAt,
    id,
  );
}

export async function deleteQuoteRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM quotes WHERE id = ?;', id);
}

export async function toggleFavoriteRecord(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE quotes SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?;', now, id);
}

type QuoteRow = {
  id: string;
  text: string;
  author: string;
  source: string;
  tags: string;
  isFavorite: number;
  createdAt: string;
  updatedAt: string;
};

function rowToQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    text: row.text,
    author: row.author,
    source: row.source,
    tags: parseTags(row.tags),
    isFavorite: row.isFavorite === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
