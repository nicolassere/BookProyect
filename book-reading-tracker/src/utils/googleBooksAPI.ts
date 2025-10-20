// src/utils/googleBooksAPI.ts
interface GoogleBookResult {
  title: string;
  authors: string[];
  publishedDate?: string;
  pageCount?: number;
  imageUrl?: string;
  isbn?: string;
  description?: string;
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookResult[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books');
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo;
      const isbn13 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;

      return {
        title: volumeInfo.title || '',
        authors: volumeInfo.authors || [],
        publishedDate: volumeInfo.publishedDate,
        pageCount: volumeInfo.pageCount,
        imageUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                  volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
        isbn: isbn13 || isbn10,
        description: volumeInfo.description,
      };
    });
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
}

export async function getBookByISBN(isbn: string): Promise<GoogleBookResult | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }

    const volumeInfo = data.items[0].volumeInfo;
    const isbn13 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
    const isbn10 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;

    return {
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      imageUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
      isbn: isbn13 || isbn10,
      description: volumeInfo.description,
    };
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return null;
  }
}