import Link from 'next/link';
import { Home, LayoutDashboard, Ghost } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/wordmark';

export default function NotFound() {
  return (
    <div className='ambient-bg flex min-h-screen flex-col items-center justify-center px-5 text-center'>
      <Link href='/' aria-label='SubTraq home' className='mb-10 inline-flex'>
        <Wordmark />
      </Link>

      <div className='glass relative w-full max-w-md overflow-hidden rounded-3xl p-8 sm:p-10'>
        <div className='pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[hsl(var(--cyan))]/20 blur-3xl' />

        <div className='relative'>
          <div className='mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--cyan))]/10 text-primary'>
            <Ghost className='h-7 w-7' />
          </div>

          <p className='text-7xl font-extrabold tracking-tight text-gradient sm:text-8xl'>
            404
          </p>
          <h1 className='mt-4 text-xl font-bold tracking-tight'>
            This page got cancelled
          </h1>
          <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
            We looked through every subscription and couldn&apos;t find this
            one. It may have been moved, renamed, or never existed.
          </p>

          <div className='mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link
              href='/'
              className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
            >
              <Home className='h-4 w-4' /> Back to home
            </Link>
            <Link
              href='/dashboard'
              className={cn(
                buttonVariants({ variant: 'glass', size: 'lg' }),
                'gap-2',
              )}
            >
              <LayoutDashboard className='h-4 w-4' /> Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
