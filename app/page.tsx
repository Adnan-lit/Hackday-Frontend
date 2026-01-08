"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  HiHome,
  HiChatAlt2,
  HiUserGroup,
  HiUsers,
  HiPhotograph,
  HiCog,
  HiSparkles,
  HiUserAdd,
} from "react-icons/hi";
import { RiCompass3Line, RiMusic2Line, RiHeart3Line } from "react-icons/ri";
import { MdMusicNote } from "react-icons/md";
import FeedWhisperCard from "@/components/FeedWhisperCard";
import MatchedEmotionRow from "@/components/MatchedEmotionRow";
import MusicRecommendationRow from "@/components/MusicRecommendationRow";
import { useWhispers } from "@/app/context/WhisperContext";
import type { Mood } from "@/app/lib/mockData";
import type { ReactionType } from "@/components/ReactionBar";

const navItems = [
  { label: "News Feed", icon: HiHome, count: undefined, active: true },
  { label: "Messages", icon: HiChatAlt2, count: 6 },
  { label: "Forums", icon: RiCompass3Line, count: undefined },
  { label: "Friends", icon: HiUsers, count: 3 },
  { label: "Media", icon: HiPhotograph, count: undefined },
  { label: "Settings", icon: HiCog, count: undefined },
];

const composerActions = [
  { label: "File", icon: "📁" },
  { label: "Image", icon: "🖼️" },
  { label: "Location", icon: "📍" },
  { label: "Emoji", icon: "😊" },
  { label: "Public", icon: "🌐" },
];

export default function HomePage() {
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "friends">(
    "latest"
  );
  const { whispers, refreshWhispers, reactToWhisper } = useWhispers();

  useEffect(() => {
    refreshWhispers();
  }, [refreshWhispers]);

  // Filter whispers
  const filteredWhispers = useMemo(() => {
    let filtered =
      moodFilter === "all"
        ? whispers
        : whispers.filter((w) => w.mood === moodFilter);

    // Sort whispers
    if (sortBy === "latest") {
      filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "trending") {
      filtered = [...filtered].sort((a, b) => {
        const totalA = Object.values(a.reactions).reduce(
          (sum, count) => sum + count,
          0
        );
        const totalB = Object.values(b.reactions).reduce(
          (sum, count) => sum + count,
          0
        );
        return totalB - totalA;
      });
    }

    return filtered;
  }, [whispers, moodFilter, sortBy]);

  const handleReaction = (whisperId: string, reaction: ReactionType) => {
    reactToWhisper(whisperId, reaction);
  };

  const moods: Array<Mood | "all"> = [
    "all",
    "happy",
    "sad",
    "calm",
    "angry",
    "excited",
    "tired",
  ];
  const moodLabels: Record<string, string> = {
    all: "All",
    happy: "😊",
    sad: "😢",
    calm: "😌",
    angry: "😡",
    excited: "🌈",
    tired: "😴",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="animate-blob absolute -left-10 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -right-16 top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-10 left-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      {/* Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto sidebar-scroll lg:block">
        <div className="glass relative h-full overflow-hidden border-r border-white/10 p-6 backdrop-blur transition-all duration-500">
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-blob absolute -left-8 top-0 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-pink-400/20 blur-3xl" />
            <div className="animate-blob animation-delay-2000 absolute bottom-0 right-0 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-400/25 via-cyan-400/20 to-blue-400/20 blur-3xl" />
            <div className="animate-blob animation-delay-4000 absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col gap-6">
            {/* Profile Section */}
            <div className="group relative flex items-center gap-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-xl font-bold text-white shadow-lg shadow-violet-500/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  🤫
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">
                  Whisper User
                </p>
                <p className="text-xs text-slate-300 truncate">@whisper</p>
              </div>
            </div>

            {/* Today Vibe Card */}
            <Link
              href="/camera"
              className="group relative z-10 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-amber-500/20 to-pink-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:z-20"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 whitespace-nowrap">
                    Today vibe
                  </span>
                  <span className="text-base font-bold text-white whitespace-nowrap">
                    Let&apos;s explore
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-amber-400 to-pink-400 text-2xl shadow-lg shadow-cyan-500/30 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <HiSparkles className="text-white" />
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`group relative flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ${
                      item.active
                        ? "bg-gradient-to-r from-white to-white/95 text-slate-900 shadow-lg shadow-white/20"
                        : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                          item.active
                            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"
                            : "bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="relative whitespace-nowrap">
                        {item.label}
                      </span>
                    </span>
                    {item.count && (
                      <span
                        className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-300 ${
                          item.active
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                            : "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md group-hover:scale-110"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    {item.active && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 to-fuchsia-500"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Create Whisper Button */}
            <div className="mt-auto">
              <Link
                href="/create"
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/50 block"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                  <HiUserAdd className="h-4 w-4 shrink-0" />
                  Create Whisper
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Fixed Right Sidebar */}
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto sidebar-scroll border-l border-white/10 p-5 lg:block">
        <div className="flex h-full flex-col gap-5 pt-6">
          <MatchedEmotionRow />
          <MusicRecommendationRow />
        </div>
      </aside>

      {/* Scrollable Main Content */}
      <main className="relative z-30 ml-0 mr-0 min-h-screen lg:ml-72 lg:mr-72">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
          {/* Header */}
          <header className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/20 backdrop-blur-md p-4 shadow-lg">
            <div className="min-w-0 flex-shrink-0">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold text-white whitespace-nowrap">
                Feeds
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 p-1 text-xs font-medium text-slate-200 shadow-inner shadow-black/30 shrink-0">
              {["Recents", "Friends", "Popular"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "Recents") setSortBy("latest");
                    else if (tab === "Friends") setSortBy("friends");
                    else if (tab === "Popular") setSortBy("trending");
                  }}
                  className={`rounded-full px-4 py-2 transition whitespace-nowrap ${
                    (tab === "Recents" && sortBy === "latest") ||
                    (tab === "Friends" && sortBy === "friends") ||
                    (tab === "Popular" && sortBy === "trending")
                      ? "bg-white text-slate-900 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          {/* Mood Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodFilter(mood)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  moodFilter === mood
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{moodLabels[mood]}</span>
                {mood !== "all" && (
                  <span className="ml-2 hidden sm:inline capitalize">
                    {mood}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="mb-6 glass animate-fade-up rounded-3xl p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 text-xl">
                🤫
              </div>
              <Link
                href="/create"
                className="flex-1 min-w-0 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 truncate"
              >
                Share something
              </Link>
              <Link
                href="/create"
                className="hidden shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02] sm:inline-block whitespace-nowrap"
              >
                Send
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-xs text-slate-200">
              {composerActions.map((action) => (
                <button
                  key={action.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10 whitespace-nowrap shrink-0"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
              <Link
                href="/create"
                className="ml-auto shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02] sm:hidden whitespace-nowrap"
              >
                Send
              </Link>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-5 pb-6">
            {filteredWhispers.length === 0 ? (
              <div className="glass animate-fade-up rounded-3xl p-8 backdrop-blur text-center">
                <p className="text-4xl mb-4">😶</p>
                <p className="text-white/60">No whispers found</p>
              </div>
            ) : (
              filteredWhispers.map((whisper, index) => (
                <div
                  key={whisper.id}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <FeedWhisperCard
                    whisper={whisper}
                    onReaction={(reaction) =>
                      handleReaction(whisper.id, reaction!)
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
