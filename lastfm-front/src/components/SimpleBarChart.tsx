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
  color = "#3b82f6",
}) => {
  const maxValue = Math.max(...data.map((item) => item[dataKey]));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 group hover:bg-gradient-to-r hover:from-gray-300 hover:to-gray-400 rounded-full p-2 transition-all duration-300"
        >
          <span
            className="text-sm font-semibold text-gray-700 w-28 truncate group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-gray-300 group-hover:to-gray-400 group-hover:rounded-full transition-all duration-300 h-9 flex items-center px-2"
            title={item[nameKey]}
          >
            {item[nameKey]}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-9 relative overflow-hidden group-hover:bg-gradient-to-r group-hover:from-gray-300 group-hover:to-gray-400 group-hover:shadow-md transition-all duration-300">
            <div
              className="h-full rounded-full transition-all duration-700 flex items-center justify-end px-4 shadow-md group-hover:shadow-lg group-hover:brightness-110"
              style={{
                width: `${(item[dataKey] / maxValue) * 100}%`,
                background: `linear-gradient(90deg, ${color}dd, ${color})`,
              }}
            >
              <span className="text-xs font-bold text-white drop-shadow">
                {item[dataKey].toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};