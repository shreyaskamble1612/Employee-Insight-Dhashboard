const chartWidth = 760;
const chartHeight = 320;
const padding = { top: 24, right: 32, bottom: 48, left: 56 };

export default function SalaryChart({ data }) {
  const grouped = data.reduce((accumulator, employee) => {
    accumulator[employee.city] = (accumulator[employee.city] || 0) + employee.salary;
    return accumulator;
  }, {});

  const entries = Object.entries(grouped);
  const maxValue = Math.max(...entries.map(([, value]) => value), 1);
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const barWidth = plotWidth / Math.max(entries.length, 1) - 24;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[640px]">
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="#cbd5e1" />
      <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="#cbd5e1" />

      {entries.map(([city, value], index) => {
        const height = (value / maxValue) * plotHeight;
        const x = padding.left + index * (barWidth + 24) + 12;
        const y = chartHeight - padding.bottom - height;

        return (
          <g key={city}>
            <rect x={x} y={y} width={barWidth} height={height} rx="14" fill="#0f172a" />
            <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" className="fill-slate-600 text-[11px]">
              ₹{Math.round(value / 1000)}k
            </text>
            <text x={x + barWidth / 2} y={chartHeight - 18} textAnchor="middle" className="fill-slate-500 text-[12px]">
              {city}
            </text>
          </g>
        );
      })}
    </svg>
  );
}