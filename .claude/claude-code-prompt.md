# Book Reading Tracker — Full Cleanup & Improvement Pass

You are working on a Book Reading Tracker app with a React/TypeScript/Vite frontend (`book-reading-tracker/`) and a FastAPI/SQLite backend (`backend/`). All code and comments must be in English per project convention.

## Phase 1: Bug Fixes (do these FIRST)

### 1. Dead code in `statsCalculator.ts`
`book-reading-tracker/src/utils/statsCalculator.ts` has TWO `return` statements in `calculateStats()`. The second return (around line 180+) is dead code. The first return already includes `academicBooks`, `academicByField`, `completeBooksCount`, `academicBooksCount`. **Delete the entire second return statement block** — it's unreachable and duplicates the first one without the academic fields.

### 2. Duplicate saga utils file
`book-reading-tracker/src/utils/sagaUtils.ts` and `book-reading-tracker/src/utils/sagaUtils.tsx` have identical content. **Delete `sagaUtils.tsx`** (it shouldn't be a tsx file — it has no JSX). Make sure all imports reference `sagaUtils.ts` (they should since .ts is the canonical extension, but verify in `SagasView.tsx` and anywhere else).

### 3. Broken imports in `InfluenceRankingView.tsx`
`book-reading-tracker/src/views/InfluenceRankingView.tsx` imports these functions from `../utils/influenceCalculator`:
- `calculateAuthorInfluence`
- `calculateCountryInfluence`
- `calculateGenreInfluence`
- `getInfluenceExplanation`
- `type InfluenceScore`

But `influenceCalculator.ts` only exports `getGenreWeight`, `GENRE_WEIGHTS`, and the `GENRE_WEIGHTS` record type.

**You need to implement the missing functions in `influenceCalculator.ts`:**

- `InfluenceScore` type: `{ name: string; normalizedScore: number; rawScore: number; breakdown: { booksCount: number; totalPages: number; weightedPages: number; avgRating: number }; topGenres: { genre: string; count: number; weight: number }[]; books: Reading[] }`
- `calculateAuthorInfluence(readings: Reading[]): InfluenceScore[]` — group by author, calculate weighted pages (pages × genreWeight), apply rating multiplier (5★=1.5x, 4★=1.2x, 3★=1.0x, 2★=0.8x, 1★=0.6x, unrated=1.0x), diversity bonus (+5% per unique genre up to 20%), favorite bonus (+10% per 5★ book). Normalize top score to 100.
- `calculateCountryInfluence(readings: Reading[]): InfluenceScore[]` — same formula but grouped by nationality.
- `calculateGenreInfluence(readings: Reading[]): InfluenceScore[]` — same formula but grouped by genre.
- `getInfluenceExplanation(score: InfluenceScore): string` — return a short human-readable summary like "12 books · 4,320 weighted pages · avg 4.2★"

The function needs to import `Reading` from `../types`. Follow the existing code style.

### 4. Dark mode toggle missing from UI
`ThemeContext.tsx` is fully implemented but there's no toggle button anywhere in the app. **Add a dark mode toggle button to `Header.tsx`** next to the language selector. Use `Moon` and `Sun` icons from lucide-react. Import `useTheme` from the ThemeContext.

## Phase 2: Data Sync Fixes

### 5. Sync reading goals with backend
In `book-reading-tracker/src/components/goals/ReadingGoalsWidget.tsx` and `App.tsx`, reading goals are only saved to localStorage. The backend already has `/api/goals` endpoints ready.

**In `BookContext.tsx`:**
- Add `readingGoal` and `setReadingGoal` to the context
- On initial load, if backend is available, fetch the goal from `api.goals.get(currentYear)`
- When goal is updated, call `api.goals.set(goal)` (fire-and-forget like books)
- Keep localStorage as fallback

**In `App.tsx`:**
- Remove the local `readingGoal` state and `useEffect` hooks for goal loading/saving
- Use `readingGoal` and `setReadingGoal` from `useBooks()` instead

### 6. Sync Hall of Fame data with backend
This is lower priority. For now, just **add a TODO comment** at the top of `hallOfFameStorage.ts` explaining that this data should eventually sync with the backend via a new `/api/hall-of-fame` endpoint, similar to how books sync.

## Phase 3: UI/UX Improvements

### 7. Add a reading heatmap to OverviewView
Add a GitHub-style reading heatmap component showing the last 365 days. Each cell = 1 day, colored by number of books finished that day (0 = gray, 1 = light green, 2+ = dark green). Use dark mode compatible colors.

Create `book-reading-tracker/src/components/charts/ReadingHeatmap.tsx`:
- Accept `readings: Reading[]` as prop
- Calculate a map of date → book count for the last 365 days
- Render a grid of 53 columns × 7 rows (weeks × days)
- Show month labels on top
- Show day labels (Mon, Wed, Fri) on left
- Tooltip on hover showing date and count
- Place it in `OverviewView` between the stat cards and the progress chart

### 8. Currently Reading as its own section
The "Leyendo ahora" section in OverviewView is good, but also **add a small badge/indicator in the Navigation bar** showing the count of currently-reading books (like a notification dot with the number). Don't create a separate nav tab — just make the existing Overview tab show a small count badge when there are books being read.

### 9. Book click navigation from all views
In `GenresView.tsx`, `NationalitiesView.tsx`, and `SagasView.tsx`, when books are shown in modals or expanded sections, clicking on a book doesn't open `BookDetailsModal`. 

**Fix:** These views need to accept an `onBookClick` callback prop (like `BooksView` already does), and `App.tsx` needs to pass `handleBookClick` to them. For views that show books inside modals (GenresView's genre detail modal), wire the click handler to close the genre modal and open the book detail modal.

## Phase 4: Architecture

### 10. Better error handling for optimistic updates
In `BookContext.tsx`, the `.catch(err => console.error(...))` pattern silently swallows backend failures.

**Add a simple toast notification system:**
- Create a `useToast` hook or add a `lastError` state to BookContext
- When a backend call fails in `addReading`, `updateReading`, `deleteReading`, set an error message
- Show a toast (reuse the existing Toast component pattern from App.tsx) that says "Error syncing with server — changes saved locally"
- Don't revert the optimistic update (local-first is fine), just inform the user

## General Rules
- All code comments in English
- Follow existing code style (functional components, hooks, Tailwind classes)
- Maintain dark mode support in all new/modified components (use `dark:` variants)
- Maintain bilingual support where UI text is shown (use `useLanguage()` or add new translation keys)
- Run `npx tsc --noEmit` after changes to verify no type errors
- Run `python -m py_compile` on any modified backend files
