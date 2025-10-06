import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);