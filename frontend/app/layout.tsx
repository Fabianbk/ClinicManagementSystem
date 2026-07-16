import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinic Management System',
  description: 'Thai Traditional Medicine Clinic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
