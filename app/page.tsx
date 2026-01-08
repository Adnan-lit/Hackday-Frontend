'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  HiHome,
  HiChatAlt2,
  HiUserGroup,
  HiUsers,
  HiPhotograph,
  HiCog,
  HiSparkles,
  HiUserAdd,
} from 'react-icons/hi';
import { RiCompass3Line, RiMusic2Line, RiHeart3Line } from 'react-icons/ri';
import { MdMusicNote } from 'react-icons/md';
import FeedWhisperCard from '@/components/FeedWhisperCard';
import { FeedSkeleton } from '@/components/SkeletonLoader';
import MatchedEmotionRow from '@/components/MatchedEmotionRow';
import MusicRecommendationRow from '@/components/MusicRecommendationRow';
import { useWhispers } from '@/app/context/WhisperContext';
import { useToast } from '@/app/context/ToastContext';
import type { Mood } from '@/app/lib/mockData';
import type { ReactionType } from '@/components/ReactionBar';

const navItems = [
  { label: 'News Feed', icon: HiHome, count: undefined, active: true },
  { label: 'Messages', icon: HiChatAlt2, count: 6 },
  { label: 'Forums', icon: RiCompass3Line, count: undefined },
  { label: 'Friends', icon: HiUsers, count: 3 },
  { label: 'Media', icon: HiPhotograph, count: undefined },
  { label: 'Settings', icon: HiCog, count: undefined },
];

const composerActions = [
  { label: 'File', icon: '📁' },
  { label: 'Image', icon: '🖼️' },
  { label: 'Location', icon: '📍' },
  { label: 'Emoji', icon: '😊' },
  { label: 'Public', icon: '🌐' },
];

export default function HomePage() {
  const [moodFilter, setMoodFilter] = useState<Mood | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'friends'>('latest');
  const [isLoading, setIsLoading] = useState(true);
  const { whispers, refreshWhispers, reactToWhisper } = useWhispers();
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      refreshWhispers();
      setIsLoading(false);
    };
    loadData();
  }, [refreshWhispers]);

  // Filter whispers
  const filteredWhispers = useMemo(() => {
    let filtered = moodFilter === 'all' 
      ? whispers 
      : whispers.filter(w => w.mood === moodFilter);

    // Sort whispers
    if (sortBy === 'latest') {
      filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'trending') {
      filtered = [...filtered].sort((a, b) => {
        const totalA = Object.values(a.reactions).reduce((sum, count) => sum + count, 0);
        const totalB = Object.values(b.reactions).reduce((sum, count) => sum + count, 0);
        return totalB - totalA;
      });
    }

    return filtered;
  }, [whispers, moodFilter, sortBy]);

  const handleReaction = (whisperId: string, reaction: ReactionType) => {
    reactToWhisper(whisperId, reaction);
    showToast('Reaction added! 💫', 'success', 2000);
  };

  const moods: Array<Mood | 'all'> = ['all', 'happy', 'sad', 'calm', 'angry', 'excited', 'tired'];
  const moodLabels: Record<string, string> = {
    all: 'All',
    happy: '😊',
    sad: '😢',
    calm: '😌',
    angry: '😡',
    excited: '🌈',
    tired: '😴',
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -left-10 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -right-16 top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-10 left-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:px-8">
        {/* Left Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="glass relative h-full overflow-hidden rounded-3xl p-6 backdrop-blur transition-all duration-500 hover:shadow-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="animate-blob absolute -left-8 top-0 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-pink-400/20 blur-3xl" />
              <div className="animate-blob animation-delay-2000 absolute bottom-0 right-0 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-400/25 via-cyan-400/20 to-blue-400/20 blur-3xl" />
              <div className="animate-blob animation-delay-4000 absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6">
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
                <div className="flex-1">
                  <p className="text-base font-bold text-white">Whisper User</p>
                  <p className="text-xs text-slate-300">@whisper</p>
                </div>
              </div>

              {/* Today Vibe Card */}
              <Link href="/camera" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-amber-500/20 to-pink-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                      Today vibe
                    </span>
                    <span className="text-base font-bold text-white">
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
                          ? 'bg-gradient-to-r from-white to-white/95 text-slate-900 shadow-lg shadow-white/20'
                          : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                            item.active
                              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md'
                              : 'bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="relative">{item.label}</span>
                      </span>
                      {item.count && (
                        <span
                          className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-300 ${
                            item.active
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md group-hover:scale-110'
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

              {/* Favorite Crew */}
              <div className="mt-auto space-y-4 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Favorite crew
                  </p>
                  <HiUserGroup className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex -space-x-2">
                  {['😊', '😌', '🌈', '😢'].map((emoji, idx) => (
                    <div
                      key={emoji}
                      className="group relative grid h-10 w-10 place-items-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-violet-500/80 to-fuchsia-500/80 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:z-10 hover:scale-110 hover:shadow-xl"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <Link
                  href="/create"
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <HiUserAdd className="h-4 w-4" />
                    Create Whisper
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold text-white">Feeds</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 p-1 text-xs font-medium text-slate-200 shadow-inner shadow-black/30">
              {['Recents', 'Friends', 'Popular'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === 'Recents') setSortBy('latest');
                    else if (tab === 'Friends') setSortBy('friends');
                    else if (tab === 'Popular') setSortBy('trending');
                  }}
                  className={`rounded-full px-4 py-2 transition ${
                    (tab === 'Recents' && sortBy === 'latest') ||
                    (tab === 'Friends' && sortBy === 'friends') ||
                    (tab === 'Popular' && sortBy === 'trending')
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          {/* Mood Filters */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter whispers by mood">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodFilter(mood)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  moodFilter === mood
                    ? 'bg-white text-slate-900 shadow-lg scale-105'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
                aria-pressed={moodFilter === mood}
                aria-label={`Filter by ${mood} mood`}
              >
                <span className="text-base">{moodLabels[mood]}</span>
                {mood !== 'all' && <span className="ml-2 hidden sm:inline capitalize">{mood}</span>}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-5">
            {isLoading ? (
              <FeedSkeleton count={3} />
            ) : filteredWhispers.length === 0 ? (
              <div className="glass animate-fade-up rounded-3xl p-8 backdrop-blur text-center">
                <p className="text-4xl mb-4">😶</p>
                <p className="text-white/60">No whispers found</p>
                <Link
                  href="/create"
                  className="mt-4 inline-block px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  Create your first whisper
                </Link>
              </div>
            ) : (
              filteredWhispers.map((whisper, index) => (
                <div
                  key={whisper.id}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <FeedWhisperCard
                    whisper={whisper}
                    onReaction={(reaction) => handleReaction(whisper.id, reaction!)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="glass animate-fade-up rounded-3xl p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 text-xl">
                🤫
              </div>
              <Link
                href="/create"
                className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
              >
                Share something
              </Link>
              <Link
                href="/create"
                className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02] sm:inline-block"
              >
                Send
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-xs text-slate-200">
              {composerActions.map((action) => (
                <button
                  key={action.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
              <Link
                href="/create"
                className="ml-auto rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02] sm:hidden"
              >
                Send
              </Link>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden w-72 shrink-0 space-y-5 lg:block">
          <MatchedEmotionRow />
          <MusicRecommendationRow />
        </aside>
      </div>
    </div>
  );
}