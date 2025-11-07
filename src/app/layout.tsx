import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenSea App',
  description: 'Modern Next.js application with authentication and API integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
