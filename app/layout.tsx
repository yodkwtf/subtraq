import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/components/auth/auth-context';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { SITE_URL as siteUrl } from '@/lib/site';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const title = 'SubTraq - Track subscriptions, kill the waste';
const description =
  'SubTraq is a beautiful subscription tracker. See every recurring payment, get renewal reminders, visualize your spend, and use AI to spot subscriptions worth cancelling.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s - SubTraq',
  },
  description,
  applicationName: 'SubTraq',
  alternates: { canonical: '/' },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: 'SubTraq',
    statusBarStyle: 'black-translucent',
  },
  keywords: [
    'subscription tracker',
    'subscription manager',
    'recurring payments',
    'renewal reminders',
    'spend tracker',
    'cancel subscriptions',
    'SubTraq',
  ],
  authors: [{ name: 'SubTraq' }],
  creator: 'SubTraq',
  category: 'finance',
  openGraph: {
    type: 'website',
    siteName: 'SubTraq',
    title,
    description,
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B0D13' },
    { media: '(prefers-color-scheme: light)', color: '#F4F6FB' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className='font-sans' suppressHydrationWarning>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
