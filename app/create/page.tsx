'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoodPicker from '@/components/MoodPicker';
import ThemeWrapper from '@/components/ThemeWrapper';
import CanvasBoard from '@/components/CanvasBoard';
import { useWhispers } from '@/app/context/WhisperContext';
import { useToast } from '@/app/context/ToastContext';
import type { Mood } from '@/app/lib/mockData';

type CreateStep = 'mood' | 'draw' | 'publish';

export default function CreatePage() {
  const router = useRouter();
  const { addNewWhisper } = useWhispers();
  const { showToast } = useToast();
  const [step, setStep] = useState<CreateStep>('mood');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [drawingUrl, setDrawingUrl] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setStep('draw');
  };

  const handleDrawingChange = (dataUrl: string) => {
    setDrawingUrl(dataUrl);
  };

  const handlePublish = async () => {
    if (!selectedMood || isPublishing) return;

    setIsPublishing(true);
    
    try {
      // Simulate network delay for better UX feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      const whisper = addNewWhisper({
        mood: selectedMood,
        theme: selectedMood,
        drawingUrl: drawingUrl || '',
        reactions: {
          love: 0,
          calm: 0,
          sad: 0,
          angry: 0,
          rainbow: 0,
        },
      });

      showToast('Whisper published successfully! 🎉', 'success');
      router.push(`/view/${whisper.id}`);
    } catch (error) {
      showToast('Failed to publish whisper. Please try again.', 'error');
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    if (step === 'draw') {
      setStep('mood');
      setDrawingUrl('');
    } else if (step === 'publish') {
      setStep('draw');
    }
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={step === 'mood' ? () => router.push('/') : handleBack}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Create Whisper</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full ${step === 'mood' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1 flex-1 rounded-full ${step === 'draw' ? 'bg-white' : step === 'publish' ? 'bg-white/30' : 'bg-white/10'}`} />
            <div className={`h-1 flex-1 rounded-full ${step === 'publish' ? 'bg-white' : 'bg-white/10'}`} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {step === 'mood' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <p className="text-4xl">Step 1</p>
              <p className="text-white/80 text-lg">How do you feel?</p>
            </div>
            <MoodPicker selectedMood={selectedMood} onSelect={handleMoodSelect} />
          </div>
        )}

        {step === 'draw' && selectedMood && (
          <div className="max-w-2xl mx-auto space-y-8">
            <ThemeWrapper mood={selectedMood}>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-2xl">Step 2</p>
                  <p className="text-white/80">Express yourself</p>
                </div>
                
                <CanvasBoard
                  onDrawingChange={handleDrawingChange}
                  width={600}
                  height={600}
                />

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setStep('mood')}
                    className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('publish')}
                    className="px-6 py-3 rounded-full bg-white hover:bg-white/90 text-gray-900 font-medium transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </ThemeWrapper>
          </div>
        )}

        {step === 'publish' && selectedMood && (
          <div className="max-w-2xl mx-auto space-y-8">
            <ThemeWrapper mood={selectedMood} fullScreen>
              <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-8 p-8">
                <div className="text-center space-y-4">
                  <p className="text-3xl">Step 3</p>
                  <p className="text-white/80 text-lg">Ready to share?</p>
                </div>

                {/* Preview */}
                <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border-2 border-white/30">
                  {drawingUrl ? (
                    <img
                      src={drawingUrl}
                      alt="Your whisper"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-50">
                        {selectedMood === 'happy' && '😊'}
                        {selectedMood === 'sad' && '😢'}
                        {selectedMood === 'calm' && '😌'}
                        {selectedMood === 'angry' && '😡'}
                        {selectedMood === 'excited' && '🌈'}
                        {selectedMood === 'tired' && '😴'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => setStep('draw')}
                    disabled={isPublishing}
                    className="flex-1 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                    aria-label="Go back to drawing"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-1 px-6 py-3 rounded-full bg-white hover:bg-white/90 text-gray-900 font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    aria-label="Publish whisper"
                  >
                    {isPublishing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" />
                        Publishing...
                      </>
                    ) : (
                      'Publish'
                    )}
                  </button>
                </div>
              </div>
            </ThemeWrapper>
          </div>
        )}
      </div>
    </main>
  );
}