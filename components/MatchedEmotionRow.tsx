'use client';

import React from 'react';
import { RiHeart3Line } from 'react-icons/ri';
import { useWhispers } from '@/app/context/WhisperContext';
import type { Mood } from '@/app/lib/mockData';
import { moodConfigs } from '@/app/lib/moodConfig';

interface MockPerson {
  id: string;
  name: string;
  mood: Mood;
  avatar: string;
  emoji: string;
  color: string;
}

const mockPeople: MockPerson[] = [
  {
    id: 'p1',
    name: 'Sarah Chen',
    mood: 'excited',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    emoji: '🎉',
    color: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    id: 'p2',
    name: 'Marcus Johnson',
    mood: 'excited',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    emoji: '✨',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'p3',
    name: 'Emma Wilson',
    mood: 'happy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    emoji: '😊',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'p4',
    name: 'David Lee',
    mood: 'excited',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    emoji: '🚀',
    color: 'from-green-500/20 to-emerald-500/20',
  },
];

export default function MatchedEmotionRow() {
  const { currentMood } = useWhispers();
  const matches = mockPeople.filter((p) => p.mood === currentMood).slice(0, 4);

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-5 backdrop-blur transition-all duration-300 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -right-8 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 blur-2xl" />
      </div>
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/30 to-rose-500/30">
              <RiHeart3Line className="h-4 w-4 text-pink-400" />
            </div>
            <h3 className="text-sm font-bold text-white whitespace-nowrap">
              People feeling the same
            </h3>
          </div>
          <button className="text-xs text-slate-300 transition hover:text-white shrink-0 whitespace-nowrap">
            See all
          </button>
        </div>
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">
              No matches yet
            </div>
          ) : (
            matches.map((person, index) => (
              <div
                key={person.id}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/5 to-white/0 p-3 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="h-12 w-12 rounded-full border-2 border-white/20 object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-pink-500 to-rose-500 text-xs shadow-lg">
                      {person.emoji}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {person.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-300 whitespace-nowrap">
                        {moodConfigs[person.mood].label}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0"></span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">2h ago</span>
                    </div>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${person.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}