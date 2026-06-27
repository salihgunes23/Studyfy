import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Studfy — AI-Native Öğrenme İşletim Sistemi',
  description:
    'Ne yüklersen yükle — PDF, el yazısı, ses, video — Studfy onu anlaşılabilir, sorgulanabilir, test edilebilir ve dinlenebilir bilgiye çevirir. Sıfır halüsinasyon: yapay zeka yalnızca senin verinden konuşur.',
  keywords: ['yapay zeka', 'eğitim', 'YKS', 'çalışma', 'RAG', 'flashcard', 'öğrenme'],
  openGraph: {
    title: 'Studfy — AI-Native Öğrenme İşletim Sistemi',
    description:
      'Notlarını, kitaplarını ve ders kayıtlarını saniyeler içinde özete, teste ve podcaste çevir.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        {/* Anahtarsız AI motoru (Google gerekmez). */}
        <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      </body>
    </html>
  );
}
