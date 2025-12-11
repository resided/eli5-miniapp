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

          // Extract image URLs from embeds
          const images: string[] = [];
          if (miniAppCast.embeds && Array.isArray(miniAppCast.embeds)) {
            for (const embed of miniAppCast.embeds) {
              // Check if embed is a string URL (image URL)
              if (typeof embed === "string") {
                const url = embed.toLowerCase();
                if (url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".webp")) {
                  images.push(embed);
                }
              }
              // Check if embed is an object with url property
              if (typeof embed === "object" && embed !== null && "url" in embed) {
                const embedObj = embed as { url?: string };
                if (typeof embedObj.url === "string") {
                  const url = embedObj.url.toLowerCase();
                  if (url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".webp")) {
                    images.push(embedObj.url);
                  }
                }
              }
            }
          }

          // Transform MiniAppCast to our Cast type
          const cast: Cast = {
            hash: miniAppCast.hash,
            text: miniAppCast.text,
            images: images.length > 0 ? images : undefined,
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
