import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hijafera Tracking Hub - CTWA & Meta CAPI Attribution Bridge',
  description: 'Full-stack tracking bridge for Meta CTWA Ads, WhatsApp, WooCommerce, Meta Pixel, and Conversions API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased font-sans bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
