import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Studfy — AI-Native Öğrenme İşletim Sistemi',
  description:
    'Ne yüklersen yükle — PDF, el yazısı, ses, video — Studfy onu anlaşılabilir, sorgulanabilir, test edilebilir ve dinlenebilir bilgiye çevirir.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
