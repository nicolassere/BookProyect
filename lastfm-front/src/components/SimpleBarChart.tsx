interface SimpleBarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  color?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  color = "#3b82f6" 
}) => {
  const maxValue = Math.max(...data.map(item => item[dataKey]));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 w-24 truncate" title={item[nameKey]}>
            {item[nameKey]}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-3"
              style={{ 
                width: `${(item[dataKey] / maxValue) * 100}%`,
                backgroundColor: color
              }}
            >
              <span className="text-xs font-semibold text-white">
                {item[dataKey]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};