import { useMemo, useState } from "react";

export default function useVirtualization(data, rowHeight, containerHeight, overscan = 6) {
    const [scrollTop, setScrollTop] = useState(0);

    return useMemo(() => {
        const visibleRows = Math.ceil(containerHeight / rowHeight);
        const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
        const endIndex = Math.min(data.length, startIndex + visibleRows + overscan * 2);
        const visibleData = data.slice(startIndex, endIndex);
        const offsetY = startIndex * rowHeight;
        const totalHeight = data.length * rowHeight;

        return {
            visibleData,
            startIndex,
            offsetY,
            totalHeight,
            setScrollTop
        };
    }, [containerHeight, data, overscan, rowHeight, scrollTop]);
}
