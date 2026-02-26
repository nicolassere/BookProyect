/**
 * api.ts – HTTP client for the Book Reading Tracker backend.
 *
 * The backend uses snake_case (date_finished, year_published …).
 * The frontend uses camelCase (dateFinished, yearPublished …).
 * All conversion happens here so the rest of the app stays unchanged.
 */

import type { Reading, AuthorProfile, ReadingGoal } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api';

// ─── Field-name mapping ──────────────────────────────────────────────────────

/** Convert a frontend Reading object → backend snake_case payload */
function toPayload(r: Reading | Omit<Reading, 'id' | 'parsedDate'>) {
  return {
    id: 'id' in r ? r.id : undefined,
    title: r.title,
    author: r.author,
    pages: r.pages,
    genre: r.genre,
    nationality: r.nationality,
    date_finished: r.dateFinished,
    timestamp: r.timestamp,
    rating: r.rating,
    collections: r.collections ?? [],
    isbn: r.isbn,
    year_published: r.yearPublished,
    read_count: r.readCount,
    cover_url: r.coverUrl,
    notes: r.notes,
    start_date: r.startDate,
    favorite: r.favorite ?? false,
    reading_type: r.readingType,
    academic_field: r.academicField,
    academic_level: r.academicLevel,
    chapters_read: r.chaptersRead,
    total_chapters: r.totalChapters,
  };
}

/** Convert a backend snake_case response → frontend Reading */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromPayload(p: any): Reading {
  return {
    id: p.id,
    title: p.title,
    author: p.author,
    pages: p.pages,
    genre: p.genre,
    nationality: p.nationality,
    dateFinished: p.date_finished,
    timestamp: p.timestamp,
    parsedDate: p.date_finished ? new Date(p.date_finished) : null,
    rating: p.rating,
    collections: p.collections ?? [],
    isbn: p.isbn,
    yearPublished: p.year_published,
    readCount: p.read_count,
    coverUrl: p.cover_url,
    notes: p.notes,
    startDate: p.start_date,
    favorite: p.favorite ?? false,
    readingType: p.reading_type,
    academicField: p.academic_field,
    academicLevel: p.academic_level,
    chaptersRead: p.chapters_read,
    totalChapters: p.total_chapters,
  };
}

/** Convert a frontend AuthorProfile → backend payload */
function profileToPayload(p: AuthorProfile) {
  return {
    name: p.name,
    nationality: p.nationality,
    primary_genre: p.primaryGenre,
    favorite_book: p.favoriteBook,
    bio: p.bio,
  };
}

/** Convert a backend author response → frontend AuthorProfile */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function profileFromPayload(p: any): AuthorProfile {
  return {
    name: p.name,
    nationality: p.nationality,
    primaryGenre: p.primary_genre,
    favoriteBook: p.favorite_book,
    bio: p.bio,
    totalBooks: 0,   // computed by statsCalculator, not stored in backend
    totalPages: 0,
  };
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  // DELETE returns 200 with a JSON body; handle empty bodies gracefully
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  /** Returns true if the backend is reachable. */
  isAvailable: async (): Promise<boolean> => {
    try {
      await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return true;
    } catch {
      return false;
    }
  },

  books: {
    list: async (): Promise<Reading[]> => {
      const data = await apiFetch<unknown[]>('/books/');
      return data.map(fromPayload);
    },

    create: async (book: Omit<Reading, 'id' | 'parsedDate'>): Promise<Reading> => {
      const data = await apiFetch<unknown>('/books/', {
        method: 'POST',
        body: JSON.stringify(toPayload(book)),
      });
      return fromPayload(data);
    },

    update: async (id: string, book: Reading): Promise<Reading> => {
      const data = await apiFetch<unknown>(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(toPayload(book)),
      });
      return fromPayload(data);
    },

    delete: async (id: string): Promise<void> => {
      await apiFetch(`/books/${id}`, { method: 'DELETE' });
    },
  },

  authors: {
    list: async (): Promise<AuthorProfile[]> => {
      const data = await apiFetch<unknown[]>('/authors/');
      return data.map(profileFromPayload);
    },

    upsert: async (profile: AuthorProfile): Promise<AuthorProfile> => {
      const data = await apiFetch<unknown>('/authors/', {
        method: 'POST',
        body: JSON.stringify(profileToPayload(profile)),
      });
      return profileFromPayload(data);
    },
  },

  goals: {
    get: async (year: number): Promise<ReadingGoal | null> => {
      try {
        const data = await apiFetch<{ year: number; target_books: number }>(`/goals/${year}`);
        return { year: data.year, targetBooks: data.target_books };
      } catch {
        return null;
      }
    },

    set: async (goal: ReadingGoal): Promise<void> => {
      await apiFetch('/goals/', {
        method: 'POST',
        body: JSON.stringify({ year: goal.year, target_books: goal.targetBooks }),
      });
    },
  },

  import: {
    /** Send a JSON backup (readings + optional author_profiles) to the backend. */
    json: async (
      readings: Reading[],
      authorProfiles: AuthorProfile[],
      replace = false,
    ): Promise<{ imported: number; skipped: number; total: number; message: string }> => {
      return apiFetch('/import/json', {
        method: 'POST',
        body: JSON.stringify({
          readings: readings.map(toPayload),
          author_profiles: authorProfiles.map(profileToPayload),
          replace,
        }),
      });
    },
  },

  export: {
    /** Opens the server-side JSON download in a new tab. */
    json: () => window.open(`${API_BASE}/export/json`, '_blank'),
    /** Opens the server-side CSV download in a new tab. */
    csv: () => window.open(`${API_BASE}/export/csv`, '_blank'),
    /** Opens the full backup JSON download (books + authors + goals). */
    backup: () => window.open(`${API_BASE}/export/backup`, '_blank'),
  },
};
