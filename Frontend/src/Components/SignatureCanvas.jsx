import { useEffect, useRef } from "react";

export default function SignatureCanvas({ width, height, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#f97316";
    context.lineWidth = Math.max(2, width / 180);
  }, [height, width]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = "touches" in event ? event.touches[0] : event;

    return {
      x: ((source.clientX - rect.left) / rect.width) * canvas.width,
      y: ((source.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const beginStroke = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) {
      return;
    }

    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const endStroke = () => {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={beginStroke}
        onMouseMove={draw}
        onMouseUp={endStroke}
        onMouseLeave={endStroke}
        onTouchStart={beginStroke}
        onTouchMove={draw}
        onTouchEnd={endStroke}
        className="absolute inset-0 h-full w-full touch-none rounded-2xl"
      />
      <button
        type="button"
        onClick={clearSignature}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
      >
        Clear Signature
      </button>
    </div>
  );
}