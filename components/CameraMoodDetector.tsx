"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import type { Mood } from "@/app/lib/mockData";
import { moodConfigs } from "@/app/lib/moodConfig";

const moods: Mood[] = ["happy", "sad", "calm", "angry", "excited", "tired"];

interface CameraMoodDetectorProps {
  onMoodSuggested?: (mood: Mood) => void;
}

type FaceApiModule = typeof import("face-api.js");

interface DetectionResult {
  mood: Mood;
  confidence: number;
  expression: string;
}

export default function CameraMoodDetector({
  onMoodSuggested,
}: CameraMoodDetectorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [suggestedMood, setSuggestedMood] = useState<Mood | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [detectedExpression, setDetectedExpression] = useState<string>("");
  const [note, setNote] = useState<string>("Camera data is not stored.");
  const [faceApi, setFaceApi] = useState<FaceApiModule | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>(
    []
  );
  const [showHistory, setShowHistory] = useState(false);

  // Lazy-load face-api.js on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("face-api.js");
        if (cancelled) return;
        setFaceApi(mod);
        const modelUrl = "/models";
        await Promise.all([
          mod.nets.tinyFaceDetector.loadFromUri(modelUrl),
          mod.nets.faceExpressionNet.loadFromUri(modelUrl),
        ]);
        if (!cancelled) {
          setModelsLoaded(true);
          setNote("Models loaded. Camera data is not stored.");
        }
      } catch {
        if (!cancelled) {
          setNote("Using simple mood guess. Camera data is not stored.");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsLivePreview(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const mapExpressionToMood = (
    expression: string | undefined,
    confidence: number
  ): Mood => {
    switch (expression) {
      case "happy":
        return "happy";
      case "sad":
        return "sad";
      case "angry":
        return "angry";
      case "surprised":
      case "fearful":
        return "excited";
      case "disgusted":
        return "angry";
      case "neutral":
      default: {
        // Low confidence neutral → calm or tired
        if (confidence < 0.3) {
          return Math.random() > 0.5 ? "calm" : "tired";
        }
        return "calm";
      }
    }
  };

  const randomFallbackMood = (): Mood => {
    const index = Math.floor(Math.random() * moods.length);
    return moods[index];
  };

  // Real-time face detection preview
  const startLivePreview = useCallback(async () => {
    if (!faceApi || !modelsLoaded || !videoRef.current || !canvasRef.current)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const detect = async () => {
      if (!videoRef.current || !canvasRef.current || !faceApi) return;

      try {
        const { TinyFaceDetectorOptions } = faceApi;
        const detections = await faceApi
          .detectSingleFace(videoRef.current, new TinyFaceDetectorOptions())
          .withFaceExpressions();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        if (detections) {
          // Draw face box
          const box = detections.detection.box;
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Show expression
          const expressions = detections.expressions;
          const sorted = Object.entries(expressions).sort(
            (a, b) => b[1] - a[1]
          );
          const [topExpression, topConfidence] = sorted[0];

          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(box.x, box.y - 30, box.width, 25);
          ctx.fillStyle = "#ffffff";
          ctx.font = "14px sans-serif";
          ctx.fillText(
            `${topExpression} ${Math.round(topConfidence * 100)}%`,
            box.x + 5,
            box.y - 10
          );

          setDetectedExpression(topExpression);
          setConfidence(topConfidence);
        }
      } catch (err) {
        // Silently fail for preview
      }

      if (isLivePreview) {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();
  }, [faceApi, modelsLoaded, isLivePreview]);

  useEffect(() => {
    if (isLivePreview && modelsLoaded) {
      startLivePreview();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx && videoRef.current) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    }
  }, [isLivePreview, modelsLoaded, startLivePreview]);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setSuggestedMood(null);
      setConfidence(0);
      setDetectedExpression("");
      setNote(
        modelsLoaded
          ? "Analyzing multiple frames for accuracy…"
          : "Looking at your vibe (simple guess)…"
      );

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Multi-frame analysis for better accuracy
      const frameResults: Array<{ expression: string; confidence: number }> =
        [];
      const frameCount = modelsLoaded ? 5 : 1;
      const frameDelay = modelsLoaded ? 300 : 1400;

      for (let i = 0; i < frameCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, frameDelay));

        if (!videoRef.current) break;

        let expression: string | undefined;
        let conf = 0;

        if (faceApi && modelsLoaded && videoRef.current) {
          try {
            const { TinyFaceDetectorOptions } = faceApi;
            const detections = await faceApi
              .detectSingleFace(videoRef.current, new TinyFaceDetectorOptions())
              .withFaceExpressions();

            if (detections?.expressions) {
              const sorted = Object.entries(detections.expressions).sort(
                (a, b) => b[1] - a[1]
              );
              [expression, conf] = sorted[0];
            }
          } catch {
            // Skip this frame
          }
        }

        if (expression && conf > 0.2) {
          frameResults.push({ expression, confidence: conf });
        }
      }

      stopStream();

      let mood: Mood;
      let finalConfidence = 0;
      let finalExpression = "";

      if (frameResults.length > 0) {
        // Average confidence and pick most common expression
        const expressionCounts: Record<
          string,
          { count: number; totalConf: number }
        > = {};
        frameResults.forEach((r) => {
          if (!expressionCounts[r.expression]) {
            expressionCounts[r.expression] = { count: 0, totalConf: 0 };
          }
          expressionCounts[r.expression].count++;
          expressionCounts[r.expression].totalConf += r.confidence;
        });

        const mostCommon = Object.entries(expressionCounts).sort(
          (a, b) => b[1].count - a[1].count
        )[0];

        finalExpression = mostCommon[0];
        finalConfidence = mostCommon[1].totalConf / mostCommon[1].count;
        mood = mapExpressionToMood(finalExpression, finalConfidence);
      } else {
        mood = randomFallbackMood();
        finalConfidence = 0.5;
        finalExpression = "neutral";
      }

      const result: DetectionResult = {
        mood,
        confidence: finalConfidence,
        expression: finalExpression,
      };

      setDetectionHistory((prev) => [result, ...prev.slice(0, 4)]);
      setSuggestedMood(mood);
      setConfidence(finalConfidence);
      setDetectedExpression(finalExpression);
      setNote(
        finalConfidence > 0.6
          ? `High confidence (${Math.round(
              finalConfidence * 100
            )}%). Tap to apply if it feels right.`
          : "Suggestion only. Tap to apply if it feels right."
      );
      setIsScanning(false);
    } catch (err) {
      stopStream();
      setIsScanning(false);
      setNote("Camera blocked. Try again if you like.");
    }
  };

  const handleStartPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsLivePreview(true);
        setNote('Live preview active. Click "Scan" to analyze.');
      }
    } catch {
      setNote("Camera blocked. Try again if you like.");
    }
  };

  const applySuggestion = () => {
    if (suggestedMood && onMoodSuggested) {
      onMoodSuggested(suggestedMood);
    }
  };

  return (
    <section className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl p-5 shadow-xl shadow-black/20 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">Camera mood assist</p>
          <p className="mt-1 text-[11px] text-white/60">
            Smile → happy · Relaxed face → calm · Frown → sad · Intense look →
            angry · Wide eyes → excited
          </p>
        </div>
        <span className="text-[11px] rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/70">
          {modelsLoaded ? "face‑api.js loaded" : "simple guess mode"}
        </span>
      </div>

      <div className="relative rounded-2xl bg-black/40 border border-white/10 overflow-hidden h-64 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-70"
          playsInline
          muted
          style={{ display: isLivePreview && modelsLoaded ? "none" : "block" }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ display: isLivePreview && modelsLoaded ? "block" : "none" }}
        />
        {!isScanning && !suggestedMood && !isLivePreview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/75">
            <span>
              {modelsLoaded
                ? "One quick look, no recording."
                : "Models not found, using simple guess."}
            </span>
            <span className="text-[11px] text-white/60">
              Tip: smile or exaggerate your expression for a clearer read.
            </span>
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <p className="text-xs text-white/80">Analyzing mood…</p>
            {modelsLoaded && (
              <p className="text-[10px] text-white/60">
                Processing multiple frames for accuracy
              </p>
            )}
          </div>
        )}
        {suggestedMood && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/60 border border-white/30 backdrop-blur-md">
                <span className="text-3xl">
                  {moodConfigs[suggestedMood].emoji}
                </span>
              </div>
              {confidence > 0 && (
                <div className="rounded-full bg-black/60 px-3 py-1 text-xs text-white/90">
                  {Math.round(confidence * 100)}% confidence
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {modelsLoaded && !isLivePreview && !isScanning && (
          <button
            onClick={handleStartPreview}
            className="px-3 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20"
          >
            Live Preview
          </button>
        )}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-900 hover:bg-white/90 disabled:opacity-60"
        >
          {isScanning ? "Scanning…" : "Scan face / gesture"}
        </button>
        {isLivePreview && (
          <button
            onClick={() => {
              stopStream();
              setNote("Preview stopped.");
            }}
            className="px-3 py-2 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
          >
            Stop
          </button>
        )}
      </div>

      {detectionHistory.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
          >
            <span>Recent detections ({detectionHistory.length})</span>
            <span>{showHistory ? "▼" : "▶"}</span>
          </button>
          {showHistory && (
            <div className="space-y-1">
              {detectionHistory.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {moodConfigs[result.mood].emoji}
                    </span>
                    <span className="capitalize">{result.mood}</span>
                    <span className="text-white/50">({result.expression})</span>
                  </div>
                  <span className="text-white/60">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {suggestedMood && (
        <div className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{moodConfigs[suggestedMood].emoji}</span>
            <div>
              <span className="text-sm capitalize block">{suggestedMood}</span>
              {detectedExpression && (
                <span className="text-[10px] text-white/60">
                  {detectedExpression} expression
                </span>
              )}
            </div>
          </div>
          <button
            onClick={applySuggestion}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-900 hover:bg-white/90"
          >
            Use mood
          </button>
        </div>
      )}

      <p className="text-[11px] text-white/50">
        Camera data is not stored. face-api.js runs only in your browser to
        suggest a mood — nothing is uploaded or saved.
      </p>
    </section>
  );
}
