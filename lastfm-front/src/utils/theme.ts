// src/utils/theme.ts

export type Theme = 'light' | 'dark';

export const themes = {
  light: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    background: {
      main: 'from-gray-50 via-blue-50/30 to-gray-50',
      card: 'bg-white',
      cardHover: 'bg-white hover:bg-gray-50',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
    },
    border: 'border-gray-200',
    shadow: 'shadow-lg',
  },
  dark: {
    primary: {
      50: '#1e293b',
      100: '#334155',
      200: '#475569',
      300: '#64748b',
      400: '#94a3b8',
      500: '#cbd5e1',
      600: '#8b5cf6',
      700: '#7c3aed',
      800: '#6d28d9',
      900: '#5b21b6',
    },
    background: {
      main: 'from-gray-900 via-purple-900/20 to-gray-900',
      card: 'bg-gray-800/90 backdrop-blur-xl',
      cardHover: 'bg-gray-800/90 hover:bg-gray-700/90',
    },
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
    },
    border: 'border-gray-700',
    shadow: 'shadow-2xl shadow-purple-900/50',
  },
};

// Función para generar color consistente por artista
export const getArtistColor = (artistName: string): string => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
    '#a855f7', '#ef4444', '#22c55e', '#eab308', '#0ea5e9'
  ];
  
  let hash = 0;
  for (let i = 0; i < artistName.length; i++) {
    hash = artistName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Gradientes musicales
export const musicGradients = {
  vinyl: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
  sunset: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600',
  ocean: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400',
  fire: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400',
  forest: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400',
  galaxy: 'bg-gradient-to-r from-purple-900 via-purple-600 to-pink-500',
  neon: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
};