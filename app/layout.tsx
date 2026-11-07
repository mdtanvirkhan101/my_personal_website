import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CommandPalette } from "@/components/website/command-palette";
import { NetworkTelemetryTracker } from "@/components/website/network-telemetry-tracker";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    const title = map["site_title"] || "MD Tanvir Khan | Software Developer & Creative Designer";
    const description =
      map["seo_description"] ||
      "Portfolio of MD Tanvir Khan – Software Developer and Creative Designer specializing in high-performance web systems and bespoke digital design.";
    const ogImage = map["seo_og_image"] || undefined;
    const canonical = map["seo_canonical_url"] || undefined;

    const favicon = map["site_favicon"] || map["favicon_url"] || map["site_logo"] || "/icon.svg";

    return {
      title,
      description,
      icons: {
        icon: favicon,
        shortcut: favicon,
        apple: favicon,
      },
      metadataBase: canonical ? new URL(canonical) : undefined,
      openGraph: {
        title,
        description,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        creator: map["seo_twitter_handle"] || undefined,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return {
      title: "MD Tanvir Khan | Software Developer & Creative Designer",
      description: "Portfolio of MD Tanvir Khan – Software Developer and Creative Designer specializing in high-performance web systems and bespoke digital design.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} font-sans min-h-screen bg-[#0E0E34] text-[#F7F6F7] antialiased selection:bg-[#00D2D3]/40 selection:text-[#F7F6F7]`}
      >
        <CommandPalette />
        <NetworkTelemetryTracker />
        {children}
      </body>
    </html>
  );
}
