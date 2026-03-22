import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyCards - Dashboard de Estudos',
  description: 'Organize seus estudos hierarquicamente com flashcards, resumos e questões.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
