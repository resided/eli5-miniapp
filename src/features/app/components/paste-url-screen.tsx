"use client";

import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";

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

interface PasteUrlScreenProps {
  castUrl: string;
  onCastUrlChange: (url: string) => void;
  onSubmit: () => void;
  error?: string | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export function PasteUrlScreen({
  castUrl,
  onCastUrlChange,
  onSubmit,
  error,
  language,
  onLanguageChange,
}: PasteUrlScreenProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-neutral-50">
      <div className="flex-1 flex flex-col p-6 relative overflow-hidden">
        <GradientOrb className="w-80 h-80 -top-20 -right-20" />

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="text-center pt-8 pb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 flex items-center justify-center shadow-xl mb-6">
              <span className="text-white font-bold text-xl">E5</span>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight">ELI5</h3>
            <p className="text-sm text-neutral-500 mt-2">
              Explain Like I&apos;m 5
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="font-medium text-neutral-900">Paste a cast URL</p>
                <p className="text-xs text-neutral-500">
                  Or use the share tab
                </p>
              </div>

              <input
                type="text"
                placeholder="Paste cast URL"
                value={castUrl}
                onChange={(e) => onCastUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmit();
                  }
                }}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent"
              />

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onSubmit}
                disabled={!castUrl.trim()}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  castUrl.trim()
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                }`}
              >
                Explain This Cast
              </button>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 text-center">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-neutral-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Quick access</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Tap share on any cast in Warpcast, then select ELI5 for
                    instant explanations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

