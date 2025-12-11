"use client";

import { useState, useEffect } from "react";
import type { Cast } from "@/features/app/types";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";

function TypeWriter({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 12);
      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex > 0) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-5 bg-neutral-900 ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

interface ResultScreenProps {
  cast: Cast;
  explanation: string;
  onReset: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export function ResultScreen({
  cast,
  explanation,
  onReset,
  language,
  onLanguageChange,
}: ResultScreenProps) {
  const [showFullCast, setShowFullCast] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTypingComplete(false);
  }, [explanation]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-neutral-50">
      <main className="flex-1 overflow-y-auto p-5">
        <div className="space-y-5 pb-4">
          <div className="text-center pt-3 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium text-white">Simplified</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 pt-2 tracking-tight">
              Here&apos;s the Simple Version
            </h3>
          </div>

          <button
            onClick={() => setShowFullCast(!showFullCast)}
            className="w-full text-left"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 p-3 transition-all duration-300 hover:border-neutral-300">
              <div className="flex items-center gap-3">
                <img
                  src={cast.author.pfpUrl}
                  alt={cast.author.displayName}
                  className="w-9 h-9 rounded-full ring-2 ring-neutral-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900">
                    {cast.author.displayName}
                  </p>
                  {!showFullCast && (
                    <p className="text-xs text-neutral-500 truncate">
                      {cast.text.slice(0, 50)}...
                    </p>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${
                    showFullCast ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {showFullCast && (
                <div>
                  <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                    {cast.text}
                  </p>
                  {cast.images && cast.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {cast.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Cast image ${idx + 1}`}
                          className="rounded-lg object-cover w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-neutral-200/50 blur-xl translate-y-2" />

            <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E5</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">Simple Explanation</p>
                  <p className="text-xs text-neutral-500">
                    No jargon, just clarity
                  </p>
                </div>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-neutral-700 leading-relaxed">
                {!typingComplete ? (
                  <TypeWriter
                    text={explanation}
                    onComplete={() => setTypingComplete(true)}
                  />
                ) : (
                  explanation
                )}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl font-medium bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/10 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Explanation
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="w-full py-3 px-4 rounded-xl font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Explain Another Cast
            </button>
          </div>

          <p className="text-xs text-neutral-400 text-center pt-4">
            A masterpiece in miniapp engineering by @ireside.eth
          </p>
        </div>
      </main>
    </div>
  );
}

