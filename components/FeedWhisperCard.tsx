"use client";

import React from "react";
import Link from "next/link";
import type { Whisper } from "@/app/lib/mockData";
import ThemeWrapper from "./ThemeWrapper";
import ReactionBar, { ReactionType } from "./ReactionBar";
import { moodConfigs } from "@/app/lib/moodConfig";

interface FeedWhisperCardProps {
  whisper: Whisper;
  onReaction?: (reaction: ReactionType) => void;
}

export default function FeedWhisperCard({
  whisper,
  onReaction,
}: FeedWhisperCardProps) {
  const config = moodConfigs[whisper.mood];
  const totalReactions = Object.values(whisper.reactions).reduce(
    (sum, count) => sum + count,
    0
  );
  const timeAgo = Math.floor((Date.now() - whisper.createdAt) / 3600000);

  return (
    <article className="glass animate-fade-up rounded-3xl p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 text-2xl shadow-md">
            {config.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {config.label} Mood
            </p>
            <p className="text-xs text-slate-300 whitespace-nowrap">
              {timeAgo}h ago
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="shrink-0 rounded-full p-2 text-slate-300 transition hover:bg-white/10"
        >
          <span className="sr-only">More</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>
      </div>

      {/* Drawing Preview */}
      <Link href={`/view/${whisper.id}`} className="block">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/20">
          {whisper.drawingUrl ? (
            <img
              src={whisper.drawingUrl}
              alt={`Whisper ${whisper.mood}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-60">{config.emoji}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Reactions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 shadow-inner shadow-black/30 shrink-0">
          <span className="text-base">❤️</span>
          <span className="text-base">😌</span>
          <span className="text-base">🌈</span>
          <span className="ml-1 text-[13px] font-semibold text-white whitespace-nowrap">
            {totalReactions}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReaction?.("love");
            }}
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-100 transition hover:bg-white/10 whitespace-nowrap"
          >
            React
          </button>
          <div className="rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 whitespace-nowrap">
            {config.label}
          </div>
        </div>
      </div>
    </article>
  );
}
