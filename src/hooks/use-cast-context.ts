"use client";

import { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import type { Cast } from "@/features/app/types";

interface CastContextResult {
  cast: Cast | null;
  isLoading: boolean;
  isFromShareTab: boolean;
}

export function useCastContext(): CastContextResult {
  const [result, setResult] = useState<CastContextResult>({
    cast: null,
    isLoading: true,
    isFromShareTab: false,
  });

  useEffect(() => {
    async function checkCastContext() {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        
        if (isInMiniApp) {
          await sdk.actions.ready();
        }
        
        const context = await sdk.context;

        if (context?.location?.type === "cast_share") {
          const miniAppCast = context.location.cast;

          const cast: Cast = {
            hash: miniAppCast.hash,
            text: miniAppCast.text,
            author: {
              fid: miniAppCast.author.fid,
              username: miniAppCast.author.username || "",
              displayName: miniAppCast.author.displayName || miniAppCast.author.username || "Unknown",
              pfpUrl: miniAppCast.author.pfpUrl || `https://api.dicebear.com/9.x/lorelei/svg?seed=${miniAppCast.author.fid}`,
            },
            images: miniAppCast.embeds?.filter((url): url is string => typeof url === "string"),
          };

          setResult({
            cast,
            isLoading: false,
            isFromShareTab: true,
          });
        } else {
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

