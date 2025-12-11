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
        
        // Debug logging
        console.log("Full SDK context:", JSON.stringify(context, null, 2));
        console.log("Context location:", context?.location);
        console.log("Location type:", context?.location?.type);

        if (context?.location?.type === "cast_share") {
          // App was opened from share tab with a cast
          const miniAppCast = context.location.cast;
          
          // Check if this is a quote cast (has parent cast info in context)
          console.log("MiniAppCast structure:", JSON.stringify(miniAppCast, null, 2));
          console.log("Has parent cast:", !!(miniAppCast as any).parent_cast);

          // Extract image URLs from embeds
          // Note: MiniAppCast.embeds is string[] (array of URL strings)
          // In the context of cast shares, embeds are typically images
          const images: string[] = [];
          if (miniAppCast.embeds && Array.isArray(miniAppCast.embeds)) {
            for (const embed of miniAppCast.embeds) {
              if (typeof embed === "string" && embed.trim().length > 0) {
                const url = embed.toLowerCase().trim();
                
                // Check for image file extensions
                const hasImageExtension = url.includes(".png") || 
                  url.includes(".jpg") || 
                  url.includes(".jpeg") || 
                  url.includes(".gif") || 
                  url.includes(".webp");
                
                // Check for common image hosting patterns and CDNs
                const isImageHost = url.includes("imgur.com") ||
                  url.includes("i.imgur.com") ||
                  url.includes("cdn.discordapp.com") ||
                  url.includes("media.tenor.com") ||
                  url.includes("giphy.com") ||
                  url.includes("media.giphy.com") ||
                  url.includes("warpcast.com/~/image") ||
                  url.includes("wrpcd.net") || // Warpcast CDN
                  url.includes("imagedelivery.net") || // Cloudflare Images
                  url.includes("cdn-cgi/imagedelivery") || // Cloudflare Images pattern
                  url.includes("cloudinary.com");
                
                // In cast shares, embeds are almost always images
                // Accept any HTTP/HTTPS URL from embeds as a potential image
                if (hasImageExtension || isImageHost || (url.startsWith("http://") || url.startsWith("https://"))) {
                  images.push(embed.trim());
                }
              }
            }
          }
          
          // Debug logging to help diagnose issues
          console.log("Cast context - text:", miniAppCast.text);
          console.log("Cast context - embeds:", miniAppCast.embeds);
          console.log("Extracted images:", images);

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
