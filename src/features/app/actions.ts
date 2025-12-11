"use server";

import OpenAI from "openai";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/features/app/constants";

// Initialize OpenAI client only if API key exists
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

/**
 * Generate an ELI5 (Explain Like I'm 5) explanation for a cast
 * Supports both text and images using GPT-4o vision
 */
export async function generateELI5Explanation(
  castText: string,
  language: LanguageCode = "en",
  images?: string[]
): Promise<string> {
  const openai = getOpenAIClient();

  const languageName = SUPPORTED_LANGUAGES[language];
  const languageInstruction = language === "en"
    ? ""
    : `\n- Respond ONLY in ${languageName}. Do not use any English.`;

  const hasImages = images && images.length > 0;
  const hasText = castText && castText.trim().length > 0;

  // If no content at all
  if (!hasImages && !hasText) {
    return "It looks like there isn't any text to explain! If you share a post with words or ideas, I can help make it simple and fun to understand. Just let me know!";
  }

  try {
    // Build the content array for the user message
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

    // Add text instruction
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
        text: "Explain what's happening in this image in simple terms. If there's text in the image, explain what it means:",
      });
    }

    // Add images
    if (hasImages) {
      for (const imageUrl of images) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageUrl },
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use gpt-4o for vision support
      messages: [
        {
          role: "system",
          content: `You are an expert at explaining complex topics in simple terms. Your job is to take a social media post (which may include text, images, or memes) and explain it as if talking to a 5-year-old.

Rules:
- Use very simple words and short sentences
- Use analogies with things kids understand (toys, games, food, animals)
- Be friendly and fun, but don't be condescending
- Keep it concise (2-4 sentences max)
- If the post is already simple, just restate it in a friendly way
- If the post contains crypto/tech jargon, translate it to everyday concepts
- If there's a meme or joke in an image, explain what makes it funny
- Read and explain any text that appears in images
- Don't use emojis unless they add clarity
- Never say "Explain like I'm 5" or reference the ELI5 concept${languageInstruction}`,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const explanation = response.choices[0]?.message?.content;

    if (!explanation) {
      throw new Error("No explanation generated");
    }

    return explanation.trim();
  } catch (error) {
    console.error("Error generating explanation:", error);
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API key is missing or invalid. Please check your environment variables.");
      }
      if (error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
    throw new Error("Failed to generate explanation. Please try again.");
  }
}

/**
 * Fetch a cast by its Warpcast URL using Neynar API
 */
export async function fetchCastByUrl(warpcastUrl: string): Promise<{
  hash: string;
  text: string;
  images: string[];
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
}> {
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Neynar API key not configured");
  }

  try {
    // Normalize the URL
    let normalizedUrl = warpcastUrl.trim();

    // Validate it's a Farcaster cast URL (warpcast.com or farcaster.xyz)
    const isWarpcast = normalizedUrl.includes("warpcast.com");
    const isFarcasterXyz = normalizedUrl.includes("farcaster.xyz");

    if (!isWarpcast && !isFarcasterXyz) {
      throw new Error("Please enter a valid Warpcast or Farcaster URL");
    }

    // Convert farcaster.xyz URLs to warpcast.com format for the API
    if (isFarcasterXyz) {
      normalizedUrl = normalizedUrl.replace("farcaster.xyz", "warpcast.com");
    }

    // Use Neynar API to fetch the cast by URL
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Neynar API error:", errorData);
      throw new Error("Cast not found. Please check the URL and try again.");
    }

    const data = await response.json();
    const cast = data.cast;

    if (!cast) {
      throw new Error("Cast not found");
    }

    // Extract image URLs from embeds
    const images: string[] = [];
    if (cast.embeds && Array.isArray(cast.embeds)) {
      for (const embed of cast.embeds) {
        // Check for direct image URLs
        if (embed.url && typeof embed.url === "string") {
          const url = embed.url.toLowerCase();
          if (url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".webp")) {
            images.push(embed.url);
          }
        }
        // Check for metadata with image
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
  } catch (error) {
    console.error("Error fetching cast:", error);
    if (error instanceof Error) {
      // Don't expose internal error details, but provide helpful messages
      if (error.message.includes("API key")) {
        throw new Error("Neynar API key is missing or invalid. Please check your environment variables.");
      }
      if (error.message.includes("Cast not found")) {
        throw error; // This is already user-friendly
      }
      if (error.message.includes("valid Warpcast")) {
        throw error; // This is already user-friendly
      }
      throw new Error("Failed to fetch cast. Please check the URL and try again.");
    }
    throw new Error("Failed to fetch cast. Please try again.");
  }
}
