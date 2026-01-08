'use client';

import React, { useRef, useEffect, useState } from 'react';

interface CanvasBoardProps {
  onDrawingChange?: (dataUrl: string) => void;
  initialDrawing?: string;
  width?: number;
  height?: number;
}

type DrawingTool = 'pen' | 'eraser';

const COLORS = ['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8dadc', '#ff006e', '#8338ec'];

export default function CanvasBoard({
  onDrawingChange,
  initialDrawing,
  width = 400,
  height = 400,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawing(true);
        saveToHistory();
      };
      img.src = initialDrawing;
    } else {
      saveToHistory();
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

      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
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
      if (isDrawing) {
        saveToHistory();
        if (onDrawingChange) {
          onDrawingChange(canvas.toDataURL());
        }
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
  }, [isDrawing, onDrawingChange, initialDrawing, width, height, currentColor, currentTool]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(dataUrl);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  const loadFromHistory = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      if (onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    };
    img.src = dataUrl;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    saveToHistory();
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      loadFromHistory(history[newStep]);
      setHasDrawing(newStep > 0);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      loadFromHistory(history[newStep]);
      setHasDrawing(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Color Palette */}
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-black/30 p-3 backdrop-blur-sm">
        <span className="text-sm text-white/70">Color:</span>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setCurrentColor(color);
                setCurrentTool('pen');
              }}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                currentColor === color && currentTool === 'pen'
                  ? 'border-white scale-110'
                  : 'border-white/30 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border-2 border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
          aria-label="Drawing canvas"
        />
      </div>

      {/* Tools */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setCurrentTool('pen')}
          className={`px-4 py-2 rounded-full transition-all backdrop-blur-sm ${
            currentTool === 'pen'
              ? 'bg-white text-gray-900'
              : 'bg-black/30 hover:bg-black/50'
          }`}
          aria-label="Pen tool"
          aria-pressed={currentTool === 'pen'}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setCurrentTool('eraser')}
          className={`px-4 py-2 rounded-full transition-all backdrop-blur-sm ${
            currentTool === 'eraser'
              ? 'bg-white text-gray-900'
              : 'bg-black/30 hover:bg-black/50'
          }`}
          aria-label="Eraser tool"
          aria-pressed={currentTool === 'eraser'}
        >
          🧹 Eraser
        </button>
        <button
          onClick={undo}
          disabled={historyStep <= 0}
          className="px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          aria-label="Undo"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={historyStep >= history.length - 1}
          className="px-4 py-2 rounded-full bg-black/30 hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          aria-label="Redo"
        >
          ↷ Redo
        </button>
        <button
          onClick={clearCanvas}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-rose-500/80 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          aria-label="Clear canvas"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
