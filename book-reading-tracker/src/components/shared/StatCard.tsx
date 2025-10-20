// src/components/shared/StatCard.tsx
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}