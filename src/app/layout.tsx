import type { Metadata, Viewport } from "next";
import "./globals.css";

const miniappEmbed = {
  version: "1",
  imageUrl: "https://eli5-miniapp.vercel.app/logo.png",
  button: {
    title: "Simplify This Cast",
    action: {
      type: "launch_miniapp",
      url: "https://eli5-miniapp.vercel.app",
      name: "ELI5",
      splashImageUrl: "https://eli5-miniapp.vercel.app/logo.png",
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "ELI5 - Explain Like I'm 5",
  description: "Simplify complex Farcaster casts into easy-to-understand explanations",
  openGraph: {
    title: "ELI5 - Explain Like I'm 5",
    description: "Simplify complex Farcaster casts into easy-to-understand explanations",
    images: ["https://eli5-miniapp.vercel.app/logo.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniappEmbed),
    "fc:frame": JSON.stringify(miniappEmbed), // Backward compatibility
    "base:app_id": "693b03118a7c4e55fec73e76",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
