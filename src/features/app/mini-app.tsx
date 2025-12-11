"use client";

import { useState, useEffect } from "react";
import type { AppState, Cast } from "@/features/app/types";
import { useCastContext } from "@/hooks/use-cast-context";
import { generateELI5Explanation, fetchCastByUrl } from "@/features/app/actions";
import { type LanguageCode } from "@/features/app/constants";
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

  const { cast: sharedCast, isLoading: contextLoading, isFromShareTab } = useCastContext();

  useEffect(() => {
    if (contextLoading) return;

    if (isFromShareTab && sharedCast) {
      setCast(sharedCast);
      setState("explaining");
      generateExplanation(sharedCast.text, language, sharedCast.images);
    } else {
      setState("no-cast");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, isFromShareTab, sharedCast]);

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

  async function handlePasteSubmit() {
    if (!castUrl.trim()) return;

    try {
      setError(null);
      setState("loading");

      const fetchedCast = await fetchCastByUrl(castUrl);
      setCast(fetchedCast);
      setState("explaining");

      await generateExplanation(fetchedCast.text, language, fetchedCast.images);
    } catch (err) {
      console.error("Failed to fetch cast:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch cast");
      setState("no-cast");
    }
  }

  async function handleLanguageChange(newLang: LanguageCode) {
    if (!cast) return;
    setLanguage(newLang);
    setState("explaining");
    await generateExplanation(cast.text, newLang, cast.images);
  }

  function handleReset() {
    setState("no-cast");
    setCast(null);
    setExplanation("");
    setCastUrl("");
    setError(null);
  }

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

  return <LoadingScreen />;
}

