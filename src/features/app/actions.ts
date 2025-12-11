"use server";

import OpenAI from "openai";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateELI5Explanation(
  castText: string,
  language: LanguageCode = "en",
  images?: string[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const languageName = SUPPORTED_LANGUAGES[language];
  const languageInstruction = language === "en"
    ? ""
    : `\n- Respond ONLY in ${languageName}. Do not use any English.`;

  const hasImages = images && images.length > 0;
  const hasText = castText && castText.trim().length > 0;

  if (!hasImages && !hasText) {
    return "It looks like there isn't any text to explain!";
  }

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  if (hasText && hasImages) {
    userContent.push({
      type: "text",
      text: `Explain this post and the image(s) in simple terms:\n\nPost text: "${castText}"`,
    });
  } else if (hasText) {
    userContent.push({
      type: "text",
      text: `Explain this post in simple terms:\n\n"${castText}"`,
    });
  } else if (hasImages) {
    userContent.push({
      type: "text",
      text: "Explain what's happening in this image in simple terms:",
    });
  }

  if (hasImages) {
    for (const imageUrl of images) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at explaining complex topics in simple terms. Explain like talking to a 5-year-old.

Rules:
- Use very simple words and short sentences
- Use analogies with things kids understand
- Keep it concise (2-4 sentences max)
- If there's a meme, explain what makes it funny
- Read and explain any text in images${languageInstruction}`,
      },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content?.trim() || "No explanation generated";
}

export async function fetchCastByUrl(warpcastUrl: string): Promise<{
  hash: string;
  text: string;
  images: string[];
  author: { fid: number; username: string; displayName: string; pfpUrl: string };
}> {
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Neynar API key not configured");
  }

  let normalizedUrl = warpcastUrl.trim();
  const isWarpcast = normalizedUrl.includes("warpcast.com");
  const isFarcasterXyz = normalizedUrl.includes("farcaster.xyz");

  if (!isWarpcast && !isFarcasterXyz) {
    throw new Error("Please enter a valid Warpcast or Farcaster URL");
  }

  if (isFarcasterXyz) {
    normalizedUrl = normalizedUrl.replace("farcaster.xyz", "warpcast.com");
  }

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/cast?type=url&identifier=${encodeURIComponent(normalizedUrl)}`,
    {
      headers: {
        accept: "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Cast not found. Please check the URL and try again.");
  }

  const data = await response.json();
  const cast = data.cast;

  const images: string[] = [];
  if (cast.embeds && Array.isArray(cast.embeds)) {
    for (const embed of cast.embeds) {
      if (embed.url && typeof embed.url === "string") {
        const url = embed.url.toLowerCase();
        if (url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".webp")) {
          images.push(embed.url);
        }
      }
      if (embed.metadata?.image?.url) {
        images.push(embed.metadata.image.url);
      }
    }
  }

  return {
    hash: cast.hash,
    text: cast.text || "",
    images,
    author: {
      fid: cast.author.fid,
      username: cast.author.username || "",
      displayName: cast.author.display_name || cast.author.username || "Unknown",
      pfpUrl: cast.author.pfp_url || `https://api.dicebear.com/9.x/lorelei/svg?seed=${cast.author.fid}`,
    },
  };
}

