import './globals.css';
import type { Metadata } from 'next';
import { sarabun, taviraj } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'พิมพ์วิมาน คลินิกการแพทย์แผนไทย',
  description: 'Thai Traditional Medicine Clinic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sarabun.variable} ${taviraj.variable}`}>
      <body>{children}</body>
    </html>
  );
}