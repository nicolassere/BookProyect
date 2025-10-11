import { CalendarDays, Calendar } from 'lucide-react';

type DatePreset = 'all' | 'last7' | 'last30' | 'last90' | 'last6months' | 'lastyear' | 'custom';

interface DateFiltersProps {
  dateRange: { min: string; max: string };
  datePreset: DatePreset;
  setDatePreset: (preset: DatePreset) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

const presets = [
  { id: 'all', label: 'All Time', icon: CalendarDays },
  { id: 'last7', label: 'Last 7 Days', icon: Calendar },
  { id: 'last30', label: 'Last 30 Days', icon: Calendar },
  { id: 'last90', label: 'Last 3 Months', icon: Calendar },
  { id: 'last6months', label: 'Last 6 Months', icon: Calendar },
  { id: 'lastyear', label: 'Last Year', icon: Calendar },
  { id: 'custom', label: 'Custom Range', icon: Calendar },
];

export const DateFilters: React.FC<DateFiltersProps> = ({
  dateRange,
  datePreset,
  setDatePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}) => (
  <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Time Period</h3>
        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
          {dateRange.min} to {dateRange.max}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setDatePreset(preset.id as DatePreset)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm transform hover:-translate-y-0.5 ${
              datePreset === preset.id
                ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <preset.icon className="w-4 h-4" />
            {preset.label}
          </button>
        ))}
      </div>
      
      {datePreset === 'custom' && (
        <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200 shadow-inner animate-slide-up">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              min={dateRange.min}
              max={dateRange.max}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={dateRange.min}
              max={dateRange.max}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => {
              setCustomStartDate('');
              setCustomEndDate('');
            }}
            className="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium text-sm border-2 border-gray-200 mt-7 transform hover:-translate-y-0.5 shadow-sm hover:shadow"
          >
            Clear
          </button>
        </div>
      )}

      {datePreset !== 'all' && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 via-blue-50 to-primary-50 rounded-xl border-2 border-primary-200 shadow-sm animate-fade-in">
          <span className="text-sm font-medium text-gray-700">
            <span className="text-primary-700 font-bold">
              {datePreset === 'custom'
                ? `${customStartDate || 'start'} to ${customEndDate || 'end'}`
                : presets.find(p => p.id === datePreset)?.label
              }
            </span>
          </span>
          <button
            onClick={() => setDatePreset('all')}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-xs border-2 border-gray-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow"
          >
            Reset to All Time
          </button>
        </div>
      )}
    </div>
  </div>
);