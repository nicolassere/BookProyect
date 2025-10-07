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
  <div className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Time Period</h3>
        <span className="text-xs text-gray-500">
          Data range: {dateRange.min} to {dateRange.max}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setDatePreset(preset.id as DatePreset)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
              datePreset === preset.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <preset.icon className="w-4 h-4" />
            {preset.label}
          </button>
        ))}
      </div>
      
      {datePreset === 'custom' && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              min={dateRange.min}
              max={dateRange.max}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={dateRange.min}
              max={dateRange.max}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setCustomStartDate('');
              setCustomEndDate('');
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-300 mt-5"
          >
            Clear
          </button>
        </div>
      )}
      
      {datePreset !== 'all' && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-gray-700">
            📊 Showing: <span className="text-blue-700 font-semibold">
              {datePreset === 'custom' 
                ? `${customStartDate || 'start'} to ${customEndDate || 'end'}`
                : presets.find(p => p.id === datePreset)?.label
              }
            </span>
          </span>
          <button
            onClick={() => setDatePreset('all')}
            className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium text-xs border border-gray-300"
          >
            Reset to All Time
          </button>
        </div>
      )}
    </div>
  </div>
);