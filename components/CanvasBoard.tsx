'use client';

import React, { useRef, useEffect, useState } from 'react';

interface CanvasBoardProps {
  onDrawingChange?: (dataUrl: string) => void;
  initialDrawing?: string;
  width?: number;
  height?: number;
}

export default function CanvasBoard({
  onDrawingChange,
  initialDrawing,
  width = 400,
  height = 400,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawing(true);
      };
      img.src = initialDrawing;
    }

    // Drawing functions
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      lastX = clientX - rect.left;
      lastY = clientY - rect.top;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      e.preventDefault(); // Prevent scrolling on touch

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      lastX = currentX;
      lastY = currentY;
      setHasDrawing(true);

      // Notify parent of drawing change (throttled)
      if (onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    };

    const stopDrawing = () => {
      if (isDrawing && onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
      setIsDrawing(false);
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing, onDrawingChange, initialDrawing, width, height]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const undo = () => {
    // For simplicity, we'll just clear the canvas
    // In a more advanced implementation, you'd maintain a history stack
    clearCanvas();
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border-2 border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={undo}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={clearCanvas}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}