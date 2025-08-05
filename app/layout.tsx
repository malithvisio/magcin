import 'react-perfect-scrollbar/dist/css/styles.css';
import '/public/assets/css/style.css';
import '/public/assets/css/hover-effects.css';
import './globals.css';
import './critical.css';
import { Metadata } from 'next';
import { Manrope, Merienda } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const manrope_init = Manrope({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--manrope',
  display: 'swap',
});
const merienda_init = Merienda({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--merienda',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TourTrails',
  description: 'Your ultimate travel companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${inter.className} ${manrope_init.variable} ${merienda_init.variable}`}
    >
      <head>
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
          crossOrigin='anonymous'
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
