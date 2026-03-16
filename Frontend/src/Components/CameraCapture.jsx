import { useRef, useState } from "react";

export default function CameraCapture({ onCapture, onRetake }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStarting, setIsStarting] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    setError("");
    setIsStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera access was denied or is unavailable in this browser.");
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setError("Start the camera before capturing a photo.");
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    onCapture({
      photoDataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height
    });
    setHasCaptured(true);
    stopCamera();
  };

  const handleRetake = async () => {
    setError("");
    setHasCaptured(false);
    onRetake?.();
    await startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-slate-950">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startCamera}
          disabled={isStarting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isStarting ? "Starting..." : "Start Camera"}
        </button>
        <button
          type="button"
          onClick={capture}
          disabled={isStarting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Capture Photo
        </button>
        {hasCaptured ? (
          <button
            type="button"
            onClick={handleRetake}
            disabled={isStarting}
            className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 disabled:opacity-60"
          >
            Retake
          </button>
        ) : null}
        <button
          type="button"
          onClick={stopCamera}
          disabled={isStarting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Stop Camera
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
