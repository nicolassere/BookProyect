interface SimpleLineChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, dataKey, nameKey }) => {
  const maxValue = Math.max(...data.map(item => item[dataKey]));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item[dataKey] / maxValue) * 80;
    return { x, y, value: item[dataKey], name: item[nameKey] };
  });

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line 
            key={y}
            x1="0" 
            y1={y} 
            x2="100" 
            y2={y} 
            stroke="#e5e7eb" 
            strokeWidth="0.2"
          />
        ))}
        
        {/* Area under line */}
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          opacity="0.2"
        />
        
        {/* Main line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="1"
              fill="#3b82f6"
              className="hover:r-2 transition-all cursor-pointer"
            >
              <title>{`${p.name}: ${p.value}`}</title>
            </circle>
          </g>
        ))}
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((item, i) => (
          <span key={i} className="text-xs text-gray-500">{item[nameKey]}</span>
        ))}
      </div>
    </div>
  );
};