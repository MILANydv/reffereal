import type { Metadata } from "next";
import { Inter, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { MaterialIconsLoader } from "@/components/MaterialIconsLoader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Refined Enterprise | ReferralSystem",
  description: "Automate referrals, eliminate fraud, and turn users into revenue",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const root = document.documentElement;
                  
                  // Remove any existing theme classes
                  root.classList.remove('dark', 'light');
                  
                  if (savedTheme === 'dark' || savedTheme === 'light') {
                    if (savedTheme === 'dark') {
                      root.classList.add('dark');
                    }
                  } else {
                    // Only use system preference if no saved theme exists
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      root.classList.add('dark');
                    }
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <MaterialIconsLoader />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
