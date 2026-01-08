"use client";

import React from "react";

export function WhisperCardSkeleton() {
  return (
    <article className="glass animate-pulse rounded-3xl p-4 backdrop-blur md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-white/10" />
      </div>

      <div className="mt-4 aspect-square w-full rounded-2xl bg-white/10" />

      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-32 rounded-full bg-white/10" />
        <div className="ml-auto flex gap-2">
          <div className="h-7 w-16 rounded-full bg-white/10" />
          <div className="h-7 w-20 rounded-full bg-white/10" />
        </div>
      </div>
    </article>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <WhisperCardSkeleton key={i} />
      ))}
    </>
  );
}
