// src/components/goals/ReadingGoalsWidget.tsx
import { useState } from 'react';
import { Target, TrendingUp, Edit2, Check, X } from 'lucide-react';
import type { Reading, ReadingGoal } from '../../types';

interface ReadingGoalsWidgetProps {
  readings: Reading[];
  goal: ReadingGoal | null;
  onUpdateGoal: (goal: ReadingGoal) => void;
}

export function ReadingGoalsWidget({ readings, goal, onUpdateGoal }: ReadingGoalsWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetBooks, setTargetBooks] = useState(goal?.targetBooks.toString() || '52');

  const currentYear = new Date().getFullYear();
  const booksThisYear = readings.filter(r => 
    r.parsedDate && r.parsedDate.getFullYear() === currentYear
  ).length;

  const targetBooksNum = goal?.targetBooks || 52;
  const progress = (booksThisYear / targetBooksNum) * 100;
  const booksRemaining = Math.max(0, targetBooksNum - booksThisYear);
  
  // Calculate if on track
  const dayOfYear = Math.floor((Date.now() - new Date(currentYear, 0, 0).getTime()) / 86400000);
  const daysInYear = new Date(currentYear, 11, 31).getDate() === 31 ? 365 : 366;
  const expectedProgress = (dayOfYear / daysInYear) * targetBooksNum;
  const booksAheadBehind = booksThisYear - expectedProgress;
  const isOnTrack = booksAheadBehind >= -2; // Within 2 books is "on track"

  const handleSave = () => {
    const num = parseInt(targetBooks);
    if (!isNaN(num) && num > 0) {
      onUpdateGoal({
        year: currentYear,
        targetBooks: num,
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Meta de Lectura {currentYear}
          </h3>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
            title="Editar meta"
          >
            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-all"
            >
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setTargetBooks(goal?.targetBooks.toString() || '52');
              }}
              className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Goal input or display */}
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meta de libros para {currentYear}
          </label>
          <input
            type="number"
            min="1"
            value={targetBooks}
            onChange={(e) => setTargetBooks(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
            autoFocus
          />
        </div>
      ) : (
        <>
          {/* Progress circle */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-blue-200 dark:text-blue-900"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className="text-blue-600 dark:text-blue-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {booksThisYear}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  de {targetBooksNum}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progreso</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Faltan</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {booksRemaining} libros
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ritmo</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  isOnTrack 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${!isOnTrack && 'transform rotate-180'}`} />
                  {isOnTrack ? 'Al día' : 'Rezagado'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-blue-200 dark:bg-blue-900 rounded-full h-3 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Status message */}
          <div className={`text-center text-sm font-medium ${
            isOnTrack 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-orange-700 dark:text-orange-400'
          }`}>
            {booksRemaining === 0 ? (
              <span>🎉 ¡Meta cumplida! ¡Sigue leyendo!</span>
            ) : isOnTrack ? (
              <span>
                Vas {Math.abs(booksAheadBehind).toFixed(1)} libros adelantado
              </span>
            ) : (
              <span>
                Necesitas leer {Math.abs(booksAheadBehind).toFixed(1)} libros más para estar al día
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}