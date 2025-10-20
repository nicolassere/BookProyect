import type { Reading } from '../types';

export function parseGoodreadsCSV(csvText: string): Reading[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const readings: Reading[] = [];
  let idCounter = Date.now();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
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
    const pagesStr = getField('Number of Pages');
    const pages = parseInt(pagesStr) || 0;
    const dateRead = getField('Date Read');
    const ratingStr = getField('My Rating');
    const rating = ratingStr ? parseInt(ratingStr) : undefined;
    const bookshelves = getField('Bookshelves');
    const isbn = getField('ISBN13') || getField('ISBN');
    const yearPublishedStr = getField('Year Published') || getField('Original Publication Year');
    const yearPublished = yearPublishedStr ? parseInt(yearPublishedStr) : undefined;
    const readCountStr = getField('Read Count');
    const readCount = readCountStr ? parseInt(readCountStr) : 1;
    
    // Solo agregar si tiene los campos mínimos requeridos
    if (title && author && dateRead) {
      // Generar un ID único usando contador incremental
      idCounter++;
      
      readings.push({
        id: `${idCounter}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        author: author.trim(),
        pages,
        genre: bookshelves.split(',')[0]?.trim() || 'Uncategorized',
        nationality: 'Unknown',
        dateFinished: dateRead,
        timestamp: Date.now().toString(),
        parsedDate: dateRead ? new Date(dateRead) : null,
        rating,
        collections: bookshelves
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        isbn: isbn || undefined,
        yearPublished,
        readCount,
      });
    }
  }
  
  console.log(`CSV parseado: ${readings.length} libros encontrados`);
  return readings;
}