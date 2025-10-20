import type { Reading } from '../types';

export function parseGoodreadsCSV(csvText: string): Reading[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const readings: Reading[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ''));
    
    const getField = (fieldName: string) => {
      const index = headers.indexOf(fieldName);
      return index >= 0 ? values[index] : '';
    };
    
    const title = getField('Title');
    const author = getField('Author');
    const pages = parseInt(getField('Number of Pages')) || 0;
    const dateRead = getField('Date Read');
    const rating = parseInt(getField('My Rating')) || undefined;
    const bookshelves = getField('Bookshelves');
    const isbn = getField('ISBN13') || getField('ISBN');
    const yearPublished = parseInt(getField('Year Published')) || undefined;
    const readCount = parseInt(getField('Read Count')) || 1;
    
    if (title && author && dateRead) {
      readings.push({
        id: Date.now().toString() + Math.random(),
        title,
        author,
        pages,
        genre: bookshelves.split(',')[0] || 'Uncategorized',
        nationality: 'Unknown',
        dateFinished: dateRead,
        timestamp: Date.now().toString(),
        parsedDate: new Date(dateRead),
        rating,
        collections: bookshelves.split(',').map(s => s.trim()).filter(Boolean),
        isbn,
        yearPublished,
        readCount,
      });
    }
  }
  
  return readings;
}