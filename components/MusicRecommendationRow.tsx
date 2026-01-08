'use client';

import React from 'react';
import { RiMusic2Line } from 'react-icons/ri';
import { MdMusicNote } from 'react-icons/md';
import { useWhispers } from '@/app/context/WhisperContext';
import { getTracksForMood } from '@/app/lib/musicMock';

export default function MusicRecommendationRow() {
  const { currentMood } = useWhispers();
  const tracks = getTracksForMood(currentMood).slice(0, 4);

  const musicForMood = tracks.map((track) => ({
    title: track.title,
    artist: track.artist,
    mood: track.mood,
    cover: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80`,
    color: track.coverColor,
    icon: '🎵',
  }));

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-5 backdrop-blur transition-all duration-300 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob animation-delay-2000 absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 blur-2xl" />
      </div>
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-500/30">
              <RiMusic2Line className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-white whitespace-nowrap">
              Music for your mood
            </h3>
          </div>
          <button className="text-xs text-slate-300 transition hover:text-white shrink-0 whitespace-nowrap">
            See all
          </button>
        </div>
        <div className="space-y-3">
          {musicForMood.map((track, index) => (
            <div
              key={track.title}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/5 to-white/0 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <div className={`h-full w-full bg-gradient-to-br ${track.color}`}></div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <MdMusicNote className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    {track.artist}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs">{track.icon}</span>
                    <span className="text-xs text-slate-400">
                      {track.mood}
                    </span>
                  </div>
                </div>
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${track.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}