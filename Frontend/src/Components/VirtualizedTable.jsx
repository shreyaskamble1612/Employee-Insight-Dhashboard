import useVirtualization from "../hooks/UseVirtualization";

export default function VirtualizedTable({ data, rowHeight = 76, height = 520, renderRow }) {
  const { visibleData, startIndex, setScrollTop, offsetY, totalHeight } =
    useVirtualization(data, rowHeight, height);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="grid grid-cols-[2.4fr_1.4fr_1.2fr_1fr] gap-4 bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
        <span>Employee</span>
        <span>Department</span>
        <span>City</span>
        <span>Salary</span>
      </div>

      <div style={{ height }} className="overflow-y-auto bg-white" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleData.map((employee, index) => renderRow(employee, startIndex + index, rowHeight))}
          </div>
        </div>
      </div>
    </div>
  );
}
