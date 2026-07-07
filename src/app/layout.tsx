import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GitHub Trending Hub | AI Curator & Telegram Digest',
  description:
    'Khám phá xu hướng mã nguồn GitHub Trending, tóm tắt chuyên sâu 3 ý Tiếng Việt bằng Google Gemini 2.5 Flash và nhận bản tin tự động qua Telegram Bot.',
  keywords: ['github trending', 'ai curator', 'gemini ai', 'telegram bot digest', 'developers'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#0d1117] text-[#f0f6fc]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
