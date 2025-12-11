"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { fetchCastByUrl, generateELI5Explanation } from "@/features/app/actions";
import { Cast, AppState } from "@/features/app/types";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [cast, setCast] = useState<Cast | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we're in a miniapp environment
        const isInMiniApp = await sdk.isInMiniApp();
        
        if (isInMiniApp) {
          // Call ready to initialize the SDK
          await sdk.actions.ready();
          
          // Get context - it's a Promise
          const context = await sdk.context;
          
          // Check if opened from cast share
          if (context?.location?.type === 'cast_share' && context.location.cast) {
            const cast = context.location.cast;
            // If opened from cast share, fetch the cast
            const castUrl = `https://warpcast.com/${cast.author.username || cast.author.fid}/${cast.hash}`;
            await handleFetchCast(castUrl);
          } else {
            setAppState("no-cast");
          }
        } else {
          // Not in miniapp, allow manual URL entry
          setAppState("no-cast");
        }
      } catch (err) {
        console.error("SDK initialization error:", err);
        // If SDK fails, still allow manual URL entry
        setAppState("no-cast");
      }
    };

    initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchCast = async (url: string) => {
    try {
      setAppState("loading");
      setError("");
      const castData = await fetchCastByUrl(url);
      setCast({
        author: castData.author,
        text: castData.text,
        hash: castData.hash,
        images: castData.images,
      });
      setAppState("no-cast"); // Show cast, ready to explain
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cast");
      setAppState("no-cast");
    }
  };

  const handleGenerateExplanation = async () => {
    if (!cast) return;

    try {
      setIsGenerating(true);
      setAppState("explaining");
      setError("");
      
      const result = await generateELI5Explanation(
        cast.text,
        selectedLanguage,
        cast.images
      );
      
      setExplanation(result);
      setAppState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate explanation");
      setAppState("no-cast");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCast(null);
    setExplanation("");
    setError("");
    setUrlInput("");
    setAppState("no-cast");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ELI5
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explain Like I'm 5 - Break down complex posts into simple terms
          </p>
        </div>

        {appState === "loading" && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {appState === "no-cast" && !cast && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter a Warpcast or Farcaster URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://warpcast.com/username/0x..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFetchCast(urlInput);
                    }
                  }}
                />
                <button
                  onClick={() => handleFetchCast(urlInput)}
                  disabled={!urlInput.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Load
                </button>
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {cast && appState === "no-cast" && (
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={cast.author.pfpUrl}
                  alt={cast.author.displayName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {cast.author.displayName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{cast.author.username}
                  </div>
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateExplanation}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isGenerating ? "Generating..." : "Explain This"}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {appState === "explaining" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Generating explanation...
            </p>
          </div>
        )}

        {appState === "result" && explanation && (
          <div className="space-y-4">
            <div className="border-l-4 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-r-lg">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                Simple Explanation:
              </h2>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {explanation}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
              {cast && (
                <button
                  onClick={handleGenerateExplanation}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
        )}

        {error && appState !== "no-cast" && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
