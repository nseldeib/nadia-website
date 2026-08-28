import type { Metadata } from 'next';
import { SITE_URL } from './lib/siteUrl';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Nadia Eldeib',
  description:
    'I build tools that make it possible for more people to build beautifully designed, highly maintainable software with AI. Currently CEO and co-founder of CodeYam.',
  openGraph: {
    title: 'Nadia Eldeib',
    description:
      'Founding, running, and other adventures. Building CodeYam in New York City.',
    url: SITE_URL,
    siteName: 'Nadia Eldeib',
    type: 'website',
  },
  alternates: { canonical: SITE_URL },
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
