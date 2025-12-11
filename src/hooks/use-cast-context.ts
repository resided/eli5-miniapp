"use client";

import { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import type { Cast } from "@/features/app/types";

interface CastContextResult {
  cast: Cast | null;
  isLoading: boolean;
  isFromShareTab: boolean;
}

/**
 * Hook to detect and extract cast context from Farcaster SDK
 *
 * When the app is opened from the share tab, the SDK context
 * will have location.type === 'cast_share' with the cast data.
 */
export function useCastContext(): CastContextResult {
  const [result, setResult] = useState<CastContextResult>({
    cast: null,
    isLoading: true,
    isFromShareTab: false,
  });

  useEffect(() => {
    async function checkCastContext() {
      try {
        const context = await sdk.context;

        if (context?.location?.type === "cast_share") {
          // App was opened from share tab with a cast
          const miniAppCast = context.location.cast;

          // Transform MiniAppCast to our Cast type
          const cast: Cast = {
            hash: miniAppCast.hash,
            text: miniAppCast.text,
            author: {
              fid: miniAppCast.author.fid,
              username: miniAppCast.author.username || "",
              displayName: miniAppCast.author.displayName || miniAppCast.author.username || "Unknown",
              pfpUrl: miniAppCast.author.pfpUrl || `https://api.dicebear.com/9.x/lorelei/svg?seed=${miniAppCast.author.fid}`,
            },
          };

          setResult({
            cast,
            isLoading: false,
            isFromShareTab: true,
          });
        } else {
          // App was opened from launcher or other location
          setResult({
            cast: null,
            isLoading: false,
            isFromShareTab: false,
          });
        }
      } catch (error) {
        console.error("Failed to get cast context:", error);
        setResult({
          cast: null,
          isLoading: false,
          isFromShareTab: false,
        });
      }
    }

    checkCastContext();
  }, []);

  return result;
}
