import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext';
import { BookProvider } from './contexts/BookContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <BookProvider>
        <App />
      </BookProvider>
    </LanguageProvider>
  </React.StrictMode>,
);