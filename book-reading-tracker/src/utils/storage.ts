// src/utils/storage.ts - ENHANCED
import type { Reading, AuthorProfile, ReadingGoal, AppSettings } from '../types';

const READINGS_KEY = 'book_readings';
const PROFILES_KEY = 'author_profiles';
const GOAL_KEY = 'reading_goal';
const SETTINGS_KEY = 'app_settings';

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

  // Reading Goal
  saveGoal: (goal: ReadingGoal): void => {
    try {
      localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  },

  loadGoal: (): ReadingGoal | null => {
    try {
      const data = localStorage.getItem(GOAL_KEY);
      if (!data) return null;
      return JSON.parse(data) as ReadingGoal;
    } catch (error) {
      console.error('Failed to load goal:', error);
      return null;
    }
  },

  // App Settings
  saveSettings: (settings: AppSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  loadSettings: (): AppSettings | null => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return null;
      return JSON.parse(data) as AppSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  },

  // Export to JSON
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

  // Export to CSV
  exportToCSV: (readings: Reading[], filename?: string): void => {
    const headers = [
      'Title',
      'Author',
      'Pages',
      'Genre',
      'Nationality',
      'Date Finished',
      'Rating',
      'Collections',
      'ISBN',
      'Year Published',
      'Notes'
    ];

    const rows = readings.map(r => [
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.author.replace(/"/g, '""')}"`,
      r.pages,
      `"${r.genre}"`,
      `"${r.nationality}"`,
      r.dateFinished,
      r.rating || '',
      `"${r.collections.join(', ')}"`,
      r.isbn || '',
      r.yearPublished || '',
      r.notes ? `"${r.notes.replace(/"/g, '""')}"` : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `book-readings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Get storage usage
  getStorageInfo: (): { used: number; available: number; percentage: number } => {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Most browsers allow 5-10MB, we'll assume 5MB
      const available = 5 * 1024 * 1024;
      const percentage = (used / available) * 100;
      
      return {
        used: Math.round(used / 1024), // KB
        available: Math.round(available / 1024), // KB
        percentage: Math.round(percentage * 10) / 10
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(READINGS_KEY);
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(GOAL_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },
};