'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasBoardProps {
  onDrawingChange?: (dataUrl: string) => void;
  initialDrawing?: string;
  width?: number;
  height?: number;
}

export default function CanvasBoard({
  onDrawingChange,
  initialDrawing,
  width = 600,
  height = 600,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const dprRef = useRef(1);
  
  const [hasDrawing, setHasDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [showTools, setShowTools] = useState(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    // Limit history to 20 steps
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryStep(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [history, historyStep]);

  const restoreState = useCallback((step: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !history[step]) return;

    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
    setHasDrawing(step >= 0);
    
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  }, [history, onDrawingChange]);

  const throttledUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    }, 100);
  }, [onDrawingChange]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Set drawing styles
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // Load initial drawing if provided
    if (initialDrawing && history.length === 0) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawing(true);
        saveState();
      };
      img.src = initialDrawing;
    }
  }, [width, height, initialDrawing, history.length, saveState]);

  // Update brush properties
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  }, [brushSize, brushColor]);

  // Drawing event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let clientX: number;
      let clientY: number;
      
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const coords = getCoordinates(e);
      lastXRef.current = coords.x;
      lastYRef.current = coords.y;
      isDrawingRef.current = true;
      
      // Draw initial point
      ctx.beginPath();
      ctx.arc(
        lastXRef.current / dprRef.current,
        lastYRef.current / dprRef.current,
        brushSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Save state before drawing
      saveState();
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const coords = getCoordinates(e);
      const currentX = coords.x;
      const currentY = coords.y;

      // Convert to logical coordinates (accounting for DPR scaling)
      const logicalX = currentX / dprRef.current;
      const logicalY = currentY / dprRef.current;
      const logicalLastX = lastXRef.current / dprRef.current;
      const logicalLastY = lastYRef.current / dprRef.current;

      ctx.beginPath();
      ctx.moveTo(logicalLastX, logicalLastY);
      ctx.lineTo(logicalX, logicalY);
      ctx.stroke();

      lastXRef.current = currentX;
      lastYRef.current = currentY;
      setHasDrawing(true);
      throttledUpdate();
    };

    const stopDrawing = (e: MouseEvent | TouchEvent) => {
      if (isDrawingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isDrawingRef.current = false;
        saveState();
        throttledUpdate();
      }
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [saveState, throttledUpdate, brushSize]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setHistory([]);
    setHistoryStep(-1);
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      restoreState(historyStep - 1);
    } else if (historyStep === 0) {
      clearCanvas();
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      restoreState(historyStep + 1);
    }
  };

  const brushSizes = [2, 4, 6, 8, 12, 16];
  const brushColors = [
    '#ffffff',
    '#000000',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
  ];

  return (
    <div className="space-y-4">
      {/* Tools Panel */}
      {showTools && (
        <div className="glass rounded-2xl p-4 backdrop-blur border border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Size:</span>
              <div className="flex gap-1">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`flex items-center justify-center rounded-full transition-all ${
                      brushSize === size
                        ? 'bg-white text-gray-900 scale-110'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    style={{
                      width: `${Math.max(size + 8, 24)}px`,
                      height: `${Math.max(size + 8, 24)}px`,
                    }}
                    title={`Brush size ${size}px`}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Color */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Color:</span>
              <div className="flex gap-1">
                {brushColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`h-8 w-8 rounded-full transition-all border-2 ${
                      brushColor === color
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm border-2 border-white/20 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-auto cursor-crosshair touch-none block"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block',
          }}
        />
        {!hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/40 text-sm">Start drawing...</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setShowTools(!showTools)}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20"
          title="Toggle tools"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button
          onClick={undo}
          disabled={historyStep < 0}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm border border-white/20 text-white"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={redo}
          disabled={historyStep >= history.length - 1}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm border border-white/20 text-white"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <button
          onClick={clearCanvas}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm border border-white/20 text-white"
          title="Clear canvas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}