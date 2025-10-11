import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group animate-scale-in">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {change && (
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-4 h-4" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);