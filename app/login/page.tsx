'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserRound, Info } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/auth-context';
import { useToast } from '@/components/ui/toast';

type Mode = 'signin' | 'signup';
type Provider = 'google';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    signIn,
    signUp,
    signInWithProvider,
    continueAsGuest,
    configured,
    isAuthed,
    loading,
  } = useAuth();

  const [mode, setMode] = React.useState<Mode>('signin');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<Provider | null>(null);

  // Only signed-in (real account) users get bounced away; guests can stay here
  // to upgrade to an account instead of being looped back to the dashboard.
  React.useEffect(() => {
    if (!loading && isAuthed) router.replace('/dashboard');
  }, [loading, isAuthed, router]);

  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'signup') {
      setMode('signup');
    }
  }, []);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim()))
      next.email = 'Enter a valid email address.';
    if (password.length < 6)
      next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp(
          email.trim(),
          password,
          name.trim() || undefined
        );
        if (needsConfirmation) {
          // Confirm email is on: no session yet, so don't send them to the app.
          toast({
            title: 'Confirm your email',
            description: `We sent a confirmation link to ${email.trim()}. Click it to verify and you'll be signed in.`,
          });
          setPassword('');
          setMode('signin');
          return;
        }
        toast({
          title: 'Welcome to SubTraq',
          description: 'Your account is ready. Start tracking your subscriptions.',
        });
      } else {
        await signIn(email.trim(), password);
        toast({ title: 'Welcome back' });
      }
      router.replace('/dashboard');
    } catch (err) {
      toast({
        title: mode === 'signup' ? 'Sign up failed' : 'Sign in failed',
        description:
          err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: Provider) => {
    setOauthLoading(provider);
    try {
      await signInWithProvider(provider);
      // On success the browser redirects to the provider, so nothing else runs.
    } catch (err) {
      toast({
        title: 'Sign in failed',
        description:
          err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'error',
      });
      setOauthLoading(null);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/dashboard');
  };

  // While auth is resolving, or when an already signed-in user is being sent to
  // the dashboard, show a loader instead of flashing the sign-in form.
  if (loading || isAuthed) {
    return (
      <div className='ambient-bg flex min-h-screen flex-col items-center justify-center gap-4'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/logo.svg' alt='' width={48} height={48} className='animate-pulse' />
        <p className='text-sm text-muted-foreground'>
          {isAuthed ? 'Taking you to your dashboard…' : 'Loading…'}
        </p>
      </div>
    );
  }

  return (
    <div className='ambient-bg flex min-h-screen flex-col'>
      <header className='mx-auto w-full max-w-6xl px-5 py-5'>
        <Link href='/' aria-label='SubTraq home' className='inline-flex'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src='/logo-wordmark.svg' alt='SubTraq' className='h-8 w-auto' />
        </Link>
      </header>

      <main className='flex flex-1 items-center justify-center px-5 pb-16'>
        <Card className='glass w-full max-w-md p-6 sm:p-8'>
          <h1 className='text-xl font-bold tracking-tight'>
            {mode === 'signin' ? 'Sign in to SubTraq' : 'Create your account'}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {mode === 'signin'
              ? 'Welcome back. Pick up right where you left off.'
              : 'Sync your subscriptions across every device.'}
          </p>

          {!configured && process.env.NODE_ENV === 'development' && (
            <div className='mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 p-3 text-xs text-amber-800 dark:text-amber-200'>
              <Info className='mt-0.5 h-4 w-4 shrink-0' />
              <span>
                Dev note: accounts need Supabase keys (see{' '}
                <code className='rounded bg-foreground/10 px-1'>guide.md</code>).
                Guests work without any setup.
              </span>
            </div>
          )}

          <div className='mt-5 space-y-2'>
              <Button
                type='button'
                variant='outline'
                className='w-full gap-2'
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
              >
                <FcGoogle className='h-4 w-4' />
                {oauthLoading === 'google'
                  ? 'Redirecting…'
                  : 'Continue with Google'}
              </Button>
              <div className='flex items-center gap-3 py-1 text-xs text-muted-foreground'>
                <span className='h-px flex-1 bg-border' />
                or use email
                <span className='h-px flex-1 bg-border' />
              </div>
            </div>

          <form onSubmit={handleSubmit} className='mt-5 space-y-4' noValidate>
            {mode === 'signup' && (
              <div className='space-y-1.5'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Your name'
                  autoComplete='name'
                />
              </div>
            )}
            <div className='space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder='you@example.com'
                autoComplete='email'
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p
                  id='email-error'
                  role='alert'
                  className='text-xs text-destructive'
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder='••••••••'
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
              />
              {errors.password && (
                <p
                  id='password-error'
                  role='alert'
                  className='text-xs text-destructive'
                >
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full gap-2'
              disabled={submitting}
            >
              {submitting
                ? 'Please wait…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
              {!submitting && <ArrowRight className='h-4 w-4' />}
            </Button>
          </form>

          <p className='mt-4 text-center text-sm text-muted-foreground'>
            {mode === 'signin'
              ? 'New to SubTraq?'
              : 'Already have an account?'}{' '}
            <button
              type='button'
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrors({});
              }}
              className='font-medium text-primary hover:underline focus-ring'
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className='my-5 flex items-center gap-3 text-xs text-muted-foreground'>
            <span className='h-px flex-1 bg-border' />
            or
            <span className='h-px flex-1 bg-border' />
          </div>

          <Button
            variant='outline'
            className='w-full gap-2'
            onClick={handleGuest}
          >
            <UserRound className='h-4 w-4' />
            Continue as guest
          </Button>
          <p className='mt-2 text-center text-xs text-muted-foreground'>
            Guests get sample data to play with. Data stays on this device.
          </p>
        </Card>
      </main>
    </div>
  );
}
