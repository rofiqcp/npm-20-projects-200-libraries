import { useEffect, useRef } from 'react';

// Colour palette for different classes
const CLASS_COLORS = [
  '#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
];

function getColor(className) {
  let hash = 0;
  for (let i = 0; i < className.length; i++) hash = className.charCodeAt(i) + ((hash << 5) - hash);
  return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
}

export default function ObjectDetection({ imageUrl, detections, naturalWidth, naturalHeight }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!detections?.length || !canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const displayW = img.clientWidth;
      const displayH = img.clientHeight;
      const scaleX = displayW / (naturalWidth || img.naturalWidth);
      const scaleY = displayH / (naturalHeight || img.naturalHeight);

      canvas.width = displayW;
      canvas.height = displayH;
      ctx.clearRect(0, 0, displayW, displayH);

      detections.forEach((det) => {
        const { bbox, class_name, confidence } = det;
        if (!bbox) return;

        const x = bbox.x * scaleX;
        const y = bbox.y * scaleY;
        const w = bbox.width * scaleX;
        const h = bbox.height * scaleY;
        const color = getColor(class_name);

        // Shadow glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, w, h);

        // Fill with low opacity
        ctx.fillStyle = `${color}22`;
        ctx.fillRect(x, y, w, h);

        ctx.shadowBlur = 0;

        // Label background
        const label = `${class_name} ${Math.round(confidence * 100)}%`;
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        const textW = ctx.measureText(label).width;
        const labelX = x;
        const labelY = y > 22 ? y - 6 : y + h + 18;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(labelX - 2, labelY - 14, textW + 10, 20, 4);
        ctx.fill();

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, labelX + 3, labelY);
      });
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }

    const ro = new ResizeObserver(draw);
    ro.observe(img);
    return () => ro.disconnect();
  }, [detections, imageUrl, naturalWidth, naturalHeight]);

  return (
    <div className="relative w-full">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Detection result"
        className="w-full rounded-xl object-contain max-h-[500px]"
        style={{ display: 'block' }}
      />
      <canvas
        ref={canvasRef}
        className="detection-canvas rounded-xl"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
