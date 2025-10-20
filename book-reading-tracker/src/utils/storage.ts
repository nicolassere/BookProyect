import type { Reading, AuthorProfile } from '../types';

const READINGS_KEY = 'book_readings';
const PROFILES_KEY = 'author_profiles';

export const storage = {
  // Readings
  saveReadings: (readings: Reading[]): void => {
    try {
      localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
    } catch (error) {
      console.error('Failed to save readings:', error);
    }
  },

  loadReadings: (): Reading[] => {
    try {
      const data = localStorage.getItem(READINGS_KEY);
      if (!data) return [];
      
      const readings = JSON.parse(data) as Reading[];
      return readings.map(r => ({
        ...r,
        parsedDate: r.dateFinished ? new Date(r.dateFinished) : null,
      }));
    } catch (error) {
      console.error('Failed to load readings:', error);
      return [];
    }
  },

  // Author Profiles
  saveProfiles: (profiles: Map<string, AuthorProfile>): void => {
    try {
      const array = Array.from(profiles.entries());
      localStorage.setItem(PROFILES_KEY, JSON.stringify(array));
    } catch (error) {
      console.error('Failed to save profiles:', error);
    }
  },

  loadProfiles: (): Map<string, AuthorProfile> => {
    try {
      const data = localStorage.getItem(PROFILES_KEY);
      if (!data) return new Map();
      
      const array = JSON.parse(data) as [string, AuthorProfile][];
      return new Map(array);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      return new Map();
    }
  },

  // Export
  exportToJSON: (readings: Reading[], filename?: string): void => {
    const dataStr = JSON.stringify(readings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `book-readings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(READINGS_KEY);
    localStorage.removeItem(PROFILES_KEY);
  },
};