"use client";

function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-neutral-800 animate-bounce"
          style={{
            animationDelay: `${i * 0.16}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
}

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

export function LoadingScreen() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <GradientOrb className="w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl p-3">
            <img
              src="/logo.png"
              alt="ELI5"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">ELI5</h3>
            <p className="text-sm text-neutral-500">Loading...</p>
            <LoadingDots />
          </div>
        </div>
      </div>
    </div>
  );
}

