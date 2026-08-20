import { Fraunces, Inter, Space_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['400', '600', '700', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600', '700', '800'] });
const spaceMono = Space_Mono({ subsets: ['latin'], variable: '--font-space-mono', weight: ['400', '700'] });

export const metadata = {
  metadataBase: new URL('https://notrevoienews.com'),
  title: { default: 'Notre Voie', template: '%s · Notre Voie' },
  description: "Aussi rapide que les réseaux sociaux, aussi fiable qu'un journal. L'actualité ivoirienne vérifiée, en direct.",
  openGraph: {
    siteName: 'Notre Voie',
    locale: 'fr_CI',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
