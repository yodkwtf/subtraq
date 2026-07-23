import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    absolute: 'SubTraq - AI Subscription Tracker & Spend Analytics',
  },
  description:
    'SubTraq tracks every subscription in one place: renewal reminders, spend analytics, multi-currency totals, and AI insights that flag what you can cancel. Free to try as a guest.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SubTraq - AI Subscription Tracker & Spend Analytics',
    description:
      'Track every subscription, get renewal reminders, visualize spend, and let AI flag what to cancel.',
    url: '/',
    type: 'website',
    siteName: 'SubTraq',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SubTraq - AI Subscription Tracker & Spend Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubTraq - AI Subscription Tracker & Spend Analytics',
    description:
      'Track every subscription, get renewal reminders, visualize spend, and let AI flag what to cancel.',
    images: ['/og-image.png'],
  },
};

const FEATURES = [
  {
    icon: CreditCard,
    title: 'Everything in one place',
    body: 'Track every recurring payment with logos, categories, billing cycles and renewal dates.',
  },
  {
    icon: Bell,
    title: 'Never miss a renewal',
    body: 'Color-coded urgency and a tunable reminder threshold keep surprise charges off your statement.',
  },
  {
    icon: BarChart3,
    title: 'See where it goes',
    body: 'Monthly and annual spend, category breakdowns, billing cadence and your most expensive habits.',
  },
  {
    icon: Wand2,
    title: 'AI cancellation insights',
    body: 'Let AI scan your stack for overlap, high cost and low usage, with estimated annual savings.',
  },
];

export default function LandingPage() {
  return (
    <div className='ambient-bg min-h-screen'>
      <header className='mx-auto flex max-w-6xl items-center justify-between px-5 py-5'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/logo-wordmark.svg' alt='SubTraq' className='h-8 w-auto' />
        <nav className='flex items-center gap-2'>
          <Link
            href='/login'
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Sign in
          </Link>
          <Link
            href='/login?mode=signup'
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className='mx-auto max-w-6xl px-5 pb-16 pt-12 text-center sm:pt-20'>
          <span className='inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground'>
            <Sparkles className='h-3.5 w-3.5 text-primary' />
            Your subscriptions, finally under control
          </span>

          <h1 className='mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl'>
            Track every subscription.{' '}
            <span className='text-gradient'>Kill the waste.</span>
          </h1>

          <p className='mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg'>
            SubTraq brings all your recurring payments together, reminds you
            before they renew, visualizes your spend, and uses AI to flag what
            you can cancel.
          </p>

          <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link
              href='/login?mode=signup'
              className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
            >
              Get started free <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href='/login'
              className={cn(buttonVariants({ variant: 'glass', size: 'lg' }))}
            >
              Try the live demo
            </Link>
          </div>

          <p className='mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
            <ShieldCheck className='h-3.5 w-3.5' />
            No credit card. Explore instantly as a guest.
          </p>
        </section>

        <section className='mx-auto max-w-6xl px-5 pb-24'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className='glass rounded-2xl p-5'>
                  <div className='mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(var(--cyan))]/10 text-primary'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <h3 className='font-semibold'>{f.title}</h3>
                  <p className='mt-1 text-sm text-muted-foreground'>{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className='mx-auto max-w-4xl px-5 pb-24'>
          <div className='glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-12'>
            <div className='pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl' />
            <div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[hsl(var(--cyan))]/20 blur-3xl' />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/logo.svg'
              alt=''
              width={44}
              height={44}
              className='mx-auto'
            />
            <h2 className='mt-5 text-2xl font-bold tracking-tight sm:text-3xl'>
              Ready to stop overpaying?
            </h2>
            <p className='mx-auto mt-3 max-w-xl text-sm text-muted-foreground'>
              Create a free account to sync your data across devices, or jump in
              as a guest to play with sample data right away.
            </p>
            <Link
              href='/login'
              className={cn(buttonVariants({ size: 'lg' }), 'mt-6 gap-2')}
            >
              Open SubTraq <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </section>
      </main>

      <footer className='border-t border-border/60'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src='/logo-wordmark.svg' alt='SubTraq' className='h-6 w-auto' />
          <p>Built for people who hate surprise charges.</p>
        </div>
      </footer>
    </div>
  );
}
