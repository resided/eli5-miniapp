"use client";

import type { Cast } from "@/features/app/types";

function GradientOrb({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`}
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(120,120,120,0.4) 50%, transparent 70%)",
      }}
    />
  );
}

function SpinningLoader() {
  return (
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-neutral-200" />
      <div
        className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-neutral-900 border-r-neutral-600 animate-spin"
      />
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <img
          src="/logo.png"
          alt="ELI5"
          className="w-12 h-12 object-contain"
        />
      </div>
    </div>
  );
}

interface ExplainingScreenProps {
  cast: Cast;
}

export function ExplainingScreen({ cast }: ExplainingScreenProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      <div className="flex-1 flex flex-col p-5 gap-5 relative overflow-hidden">
        <GradientOrb className="w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-start gap-3">
            <img
              src={cast.author.pfpUrl}
              alt={cast.author.displayName}
              className="w-10 h-10 rounded-full ring-2 ring-neutral-100"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-900">{cast.author.displayName}</p>
              <p className="text-xs text-neutral-500">
                @{cast.author.username}
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3 leading-relaxed line-clamp-4">
            {cast.text}
          </p>
          {cast.images && cast.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {cast.images.map((img, idx) => (
                <div key={idx} className="relative w-full aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`Cast image ${idx + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                    onError={(e) => {
                      // Hide broken images
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      // Ensure image is visible when loaded
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'block';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6">
          <SpinningLoader />

          <div className="text-center space-y-2">
            <p className="font-medium text-neutral-900">Simplifying...</p>
            <p className="text-sm text-neutral-500">
              Breaking down complex ideas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

