// src/components/insights/ReadingInsights.tsx
import { Lightbulb, TrendingUp, Star, BookOpen, Globe } from 'lucide-react';
import type { Reading, Stats } from '../../types';

interface ReadingInsightsProps {
  readings: Reading[];
  stats: Stats;
}

export function ReadingInsights({ readings, stats }: ReadingInsightsProps) {
  const insights = generateInsights(readings, stats);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-sm border-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Insights de Lectura
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
          >
            <div className={`p-2 rounded-lg ${insight.color}`}>
              {insight.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {insight.text}
              </p>
              {insight.detail && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {insight.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Insight {
  icon: React.ReactNode;
  text: string;
  detail?: string;
  color: string;
}

function generateInsights(readings: Reading[], stats: Stats): Insight[] {
  const insights: Insight[] = [];

  // Reading pace
  const currentYear = new Date().getFullYear();
  const booksThisYear = readings.filter(r => 
    r.parsedDate && r.parsedDate.getFullYear() === currentYear
  ).length;
  
  const monthsPassed = new Date().getMonth() + 1;
  const avgPerMonth = booksThisYear / monthsPassed;

  if (avgPerMonth >= 4) {
    insights.push({
      icon: <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />,
      text: `¡Ritmo excelente! Lees ~${avgPerMonth.toFixed(1)} libros al mes`,
      detail: `Con este ritmo, llegarás a ${Math.round(avgPerMonth * 12)} libros este año`,
      color: 'bg-green-100 dark:bg-green-900/30',
    });
  }

  // Favorite genres
  if (stats.genreDistribution.length > 0) {
    const topGenre = stats.genreDistribution[0];
    const percentage = ((topGenre.count / readings.length) * 100).toFixed(0);
    insights.push({
      icon: <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      text: `${topGenre.genre} es tu género favorito`,
      detail: `${percentage}% de tus lecturas (${topGenre.count} libros)`,
      color: 'bg-blue-100 dark:bg-blue-900/30',
    });
  }

  // Highly rated books
  const ratedBooks = readings.filter(r => r.rating);
  if (ratedBooks.length > 0) {
    const avgRating = ratedBooks.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedBooks.length;
    const fiveStars = ratedBooks.filter(r => r.rating === 5).length;
    
    if (avgRating >= 4) {
      insights.push({
        icon: <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        text: `Calificación promedio alta: ${avgRating.toFixed(1)} estrellas`,
        detail: fiveStars > 0 ? `Has dado 5 estrellas a ${fiveStars} libros` : undefined,
        color: 'bg-amber-100 dark:bg-amber-900/30',
      });
    }
  }

  // Nationality diversity
  const nationalities = new Set(readings.map(r => r.nationality)).size;
  if (nationalities >= 10) {
    insights.push({
      icon: <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      text: `Lector diverso: ${nationalities} nacionalidades diferentes`,
      detail: stats.authorsByNationality[0] 
        ? `Más leídos: ${stats.authorsByNationality[0].nationality}` 
        : undefined,
      color: 'bg-indigo-100 dark:bg-indigo-900/30',
    });
  }

  // Long books
  const longBooks = readings.filter(r => r.pages >= 500).length;
  if (longBooks > 0) {
    const percentage = ((longBooks / readings.length) * 100).toFixed(0);
    insights.push({
      icon: <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      text: `${longBooks} libros de 500+ páginas completados`,
      detail: `${percentage}% de tus lecturas son extensas`,
      color: 'bg-purple-100 dark:bg-purple-900/30',
    });
  }

  // Recent activity
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const recentBooks = readings.filter(r => 
    r.parsedDate && r.parsedDate >= lastMonth
  ).length;

  if (recentBooks >= 4) {
    insights.push({
      icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      text: `¡Gran mes! ${recentBooks} libros en los últimos 30 días`,
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
    });
  }

  // If no insights, add encouraging message
  if (insights.length === 0) {
    insights.push({
      icon: <Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
      text: 'Sigue leyendo para generar insights personalizados',
      detail: 'Cuantos más libros agregues, mejores serán tus estadísticas',
      color: 'bg-gray-100 dark:bg-gray-700',
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}