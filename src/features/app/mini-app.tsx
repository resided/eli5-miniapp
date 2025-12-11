"use client";

import { useState, useEffect } from "react";
import type { AppState, Cast } from "@/features/app/types";
import { useCastContext } from "@/hooks/use-cast-context";
import { generateELI5Explanation, fetchCastByUrl } from "@/features/app/actions";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";
import { LoadingScreen } from "@/features/app/components/loading-screen";
import { PasteUrlScreen } from "@/features/app/components/paste-url-screen";
import { ExplainingScreen } from "@/features/app/components/explaining-screen";
import { ResultScreen } from "@/features/app/components/result-screen";

export function MiniApp() {
  const [state, setState] = useState<AppState>("loading");
  const [cast, setCast] = useState<Cast | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [castUrl, setCastUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");

  // Get cast context from Farcaster SDK (share tab)
  const { cast: sharedCast, isLoading: contextLoading, isFromShareTab } = useCastContext();

  // Handle cast context detection
  useEffect(() => {
    if (contextLoading) return;

    if (isFromShareTab && sharedCast) {
      // Cast came from share tab - start explaining immediately
      setCast(sharedCast);
      setState("explaining");
      generateExplanation(sharedCast.text, language, sharedCast.images);
    } else {
      // No shared cast - show URL input screen
      setState("no-cast");
    }
  }, [contextLoading, isFromShareTab, sharedCast]);

  // Generate AI explanation for a cast (with optional images)
  async function generateExplanation(castText: string, lang: LanguageCode, images?: string[]) {
    try {
      setError(null);
      const result = await generateELI5Explanation(castText, lang, images);
      setExplanation(result);
      setState("result");
    } catch (err) {
      console.error("Failed to generate explanation:", err);
      setError(err instanceof Error ? err.message : "Failed to generate explanation");
      setState("no-cast");
    }
  }

  // Handle paste URL submission
  async function handlePasteSubmit() {
    if (!castUrl.trim()) return;

    try {
      setError(null);
      setState("loading");

      // Fetch the cast from the URL (includes images)
      const fetchedCast = await fetchCastByUrl(castUrl);
      setCast(fetchedCast);
      setState("explaining");

      // Generate explanation with images
      await generateExplanation(fetchedCast.text, language, fetchedCast.images);
    } catch (err) {
      console.error("Failed to fetch cast:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch cast");
      setState("no-cast");
    }
  }

  // Handle re-explain in a different language
  async function handleLanguageChange(newLang: LanguageCode) {
    if (!cast) return;
    setLanguage(newLang);
    setState("explaining");
    await generateExplanation(cast.text, newLang, cast.images);
  }

  // Handle reset to try another cast
  function handleReset() {
    setState("no-cast");
    setCast(null);
    setExplanation("");
    setCastUrl("");
    setError(null);
  }

  // Render appropriate screen based on state
  if (state === "loading") {
    return <LoadingScreen />;
  }

  if (state === "no-cast") {
    return (
      <PasteUrlScreen
        castUrl={castUrl}
        onCastUrlChange={setCastUrl}
        onSubmit={handlePasteSubmit}
        error={error}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  if (state === "explaining" && cast) {
    return <ExplainingScreen cast={cast} />;
  }

  if (state === "result" && cast) {
    return (
      <ResultScreen
        cast={cast}
        explanation={explanation}
        onReset={handleReset}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // Fallback
  return <LoadingScreen />;
}
