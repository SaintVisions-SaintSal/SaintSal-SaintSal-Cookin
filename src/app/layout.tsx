import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "SaintSal™ - Cookin' Knowledge",
    template: "%s | SaintSal™",
  },
  description: "SaintSal™ provides innovative digital solutions for faith communities, connecting believers worldwide through technology.",
  keywords: [
    "AI assistant",
    "faith technology",
    "digital solutions",
    "church management",
    "faith community",
    "AI chat",
    "agent hub",
    "web assistant",
  ],
  authors: [{ name: "SaintSal™" }],
  creator: "SaintSal™",
  publisher: "SaintSal™",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://saintsal.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: "SaintSal™",
    title: "SaintSal™ - Cookin' Knowledge",
    description: "SaintSal™ provides innovative digital solutions for faith communities, connecting believers worldwide through technology.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: "SaintSal™ Logo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SaintSal™ - Cookin' Knowledge",
    description: "SaintSal™ provides innovative digital solutions for faith communities, connecting believers worldwide through technology.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <SmoothScroll />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
