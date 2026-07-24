# SubTraq - Setup Guide

This is a complete, step-by-step setup for running SubTraq locally and deploying it.
Everything that needs a key or external account is covered here.

SubTraq works out of the box with **zero setup** in guest mode (data stays in your
browser). The steps below unlock the optional extras:

- **AI features** (Insights, Ask AI, and Add-form auto-fill): need a free Google Gemini API key.
- **Accounts + cloud sync**: need a free Supabase project.
- **Google sign-in**: needs the Google provider enabled in Supabase (section 5.6).
- **SEO / social preview**: needs your deployed site URL.

These work with **no setup at all**:

- **Multi-currency totals** convert via a free, key-less exchange-rate API (`/api/fx`),
  falling back to bundled rates offline.
- **Renewal reminders** use the browser's notification permission (no server needed).
- **Installable PWA + offline mode** ship with the app.
- **Country flags** render as SVGs (from flagcdn.com) so they show on Windows too.

---

## 1. Prerequisites

| Tool    | Version                                  | Notes                                         |
| ------- | ---------------------------------------- | --------------------------------------------- |
| Node.js | **20 LTS or newer** (22 LTS recommended) | https://nodejs.org/ then check with `node -v` |
| npm     | comes with Node                          | check with `npm -v`                           |
| Git     | any recent version                       | optional, for cloning                         |

---

## 2. Install & run locally

```bash
# from the project folder
npm install
npm run dev
```

Open http://localhost:3000. You'll land on the marketing page. Click **Try the live
demo** then **Continue as guest** to use the full app immediately with sample data.

---

## 3. Environment variables

Copy the example file and fill in only the values you need:

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored, so your secrets never get committed. Restart `npm run dev`
after changing it.

| Variable                               | Required? | What it does                                                              |
| -------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                       | optional  | Powers all AI features (Insights, Ask AI, Add-form auto-fill). Free tier. |
| `NEXT_PUBLIC_SUPABASE_URL`             | optional  | Enables real accounts + cloud sync.                                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | optional  | Public Supabase key (safe to ship; protected by RLS).                     |
| `NEXT_PUBLIC_SITE_URL`                 | optional  | Your production URL, used for SEO/Open Graph absolute links.              |

There are **no other keys to set**. FX conversion, reminders, and the PWA need nothing.

---

## 4. AI features (Google Gemini), optional

One **free** key unlocks every AI feature:

- **AI Insights** on the dashboard ("Analyse my subscriptions") - cancellation suggestions.
- **Ask AI** (input at the bottom of the AI panel) - free-form questions about your stack.
- **AI auto-fill** in the Add/Edit form - guesses the category + billing cycle from a name.

The app uses Google's **Gemini** API, which has a generous free tier (no credit card
required) via Google AI Studio.

Steps:

1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key** (you can use it in a new or existing Google Cloud project). Copy
   the key.
3. Add it to `.env.local`:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```
4. Restart the dev server. The AI features will now work.

> The app calls the `gemini-flash-latest` model server-side via the routes under
> `app/api/ai-*`. That's a rolling alias for the current free-tier **Flash** model, so it
> keeps working as Google rotates versions. The key is read on the server only and never
> exposed to the browser. Without a key, every other feature still works; only the AI buttons
> are disabled.
>
> **Seeing `quota exceeded` / `limit: 0`?** The free tier is model-specific, and Google
> retires old models (for example `gemini-2.0-flash` was shut down in mid-2026). Only **Flash**
> and **Flash-Lite** models are on the free tier - Pro models require billing. Fix it by
> setting a current free model in `.env.local`, e.g. `GEMINI_MODEL=gemini-flash-lite-latest`,
> then restart. To see exactly which models your key can use, open
> https://aistudio.google.com/ (or list them: `curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"`).

---

## 5. Accounts & cloud sync (Supabase), optional

Supabase gives every user their own login and stores their data in the cloud. The free
tier is plenty for a side project.

### 5.1 Create the project

1. Go to https://supabase.com/ and sign in (GitHub login is easiest).
2. Click **New project**. Pick a name (e.g. `subtraq`), set a strong database password
   (save it somewhere), and choose the region closest to you.
3. Wait about 2 minutes for it to provision.

### 5.2 Grab your URL and key

> Supabase changed this screen in 2025. The fastest way to get both values is the green
> **Connect** button at the top of the dashboard - it shows your Project URL and API key
> together. If you'd rather find them manually:

1. **Project URL** - open **Settings (gear icon) -> API** and copy the **Project URL**
   (`https://<project-ref>.supabase.co`) into `NEXT_PUBLIC_SUPABASE_URL`.
2. **API key** - open **Settings -> API Keys**. Supabase now issues new-style keys:
   - Copy the **Publishable key** (starts with `sb_publishable_`) into
     `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. This is the browser-safe key that replaces the old
     "anon" key; it's safe to ship publicly because your data is protected by RLS (step 5.3).
   - Only see older keys? The **anon** key under the **Legacy API keys** tab also works -
     paste that instead. (Legacy keys are being retired in late 2026, so prefer the
     publishable key when you have it.)

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

> **Never** put a **Secret** key (`sb_secret_...`) or the `service_role` key in a
> `NEXT_PUBLIC_*` variable - those bypass RLS and must stay server-side only.

### 5.3 Create the data table (with security)

SubTraq stores each user's whole dataset as a single JSON row, protected by Row Level
Security so users can only read/write their own row.

1. In Supabase, open **SQL Editor -> New query**.
2. Paste and **Run** this:

```sql
-- One JSON blob of subscriptions/activity/settings per user.
create table if not exists public.subscriptions_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock it down: a user can only touch their own row.
alter table public.subscriptions_data enable row level security;

create policy "Users manage their own data"
  on public.subscriptions_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 5.4 Configure email auth

1. Open **Authentication -> Sign In / Providers** and make sure **Email** is enabled.
2. For easy local testing, turn **off** "Confirm email" (Authentication -> Providers ->
   Email -> _Confirm email_). New sign-ups can then log in immediately without an inbox.
   - Leave it **on** for production if you want verified emails. With it on, users must
     click the link in their email before their first sign-in.
3. (Optional) Under **Authentication -> URL Configuration**, set the **Site URL** to
   `http://localhost:3000` for local dev, and your real domain for production.

### 5.5 Try it

Restart `npm run dev`, go to **Sign in -> Create an account**, and register. Your data now
syncs to Supabase and follows you across devices and browsers. The amber "guest" banner
disappears once you're signed in.

### 5.6 Google sign-in (optional)

The **Continue with Google** button on the login page is always visible, but it only works
once you (1) create a Google OAuth client and (2) enable Google in Supabase. This is the
fiddliest part, so here it is in full.

**A. Get the callback URL from Supabase first** (you'll paste it into Google).

1. In Supabase, open **Authentication -> Sign In / Providers** and click **Google**.
2. Toggle **Enable Sign in with Google** on. Supabase reveals a **Callback URL (for OAuth)**
   shaped like `https://<project-ref>.supabase.co/auth/v1/callback`. Copy it and keep this
   tab open - you'll come back to paste the Client ID/Secret.

**B. Create the Google OAuth client** (this is the "where do I even make it" part).

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign in.
2. Create or pick a project: use the project dropdown in the top bar -> **New Project**, name
   it (e.g. `SubTraq`), **Create**, then make sure that project is selected.
3. **Set up the consent screen first** - Google won't let you create a client until you do.
   Open the left menu -> **APIs & Services -> OAuth consent screen** (in the newer console
   this is **Google Auth Platform -> Branding**). If prompted:
   - User type **External**, then **Create**.
   - Fill **App name**, **User support email**, and **Developer contact email**. Leave
     everything else default and save.
   - Under **Audience**, leaving it in **Testing** is fine for personal use - just add your
     own Google account under **Test users** so you're allowed to log in. (To let anyone in,
     you'd later click **Publish app**.)
4. **Now create the client.** Go to **APIs & Services -> Credentials** (newer console:
   **Google Auth Platform -> Clients**) -> **+ Create Credentials -> OAuth client ID** (or
   **+ Create client**). Choose **Application type: Web application** and give it any name.
5. Under **Authorized redirect URIs**, click **+ Add URI** and paste the Supabase **Callback
   URL** from step A2 exactly. (Optional) under **Authorized JavaScript origins**, add
   `http://localhost:3000` and your production URL (e.g. `https://subtraq.yodkwtf.com`).
6. Click **Create**, then copy the **Client ID** and **Client secret** from the popup.

**C. Finish in Supabase.**

1. Back on the Supabase **Google** provider page, paste the **Client ID** and **Client
   secret**, and **Save**.
2. Open **Authentication -> URL Configuration**:
   - **Site URL**: `http://localhost:3000` for local dev (change it to your domain in
     production - see **6.1**).
   - **Redirect URLs**: add `http://localhost:3000/**`. The app returns users to `/dashboard`
     after login, so the `/**` wildcard is easiest.

**Continue with Google** now works locally. If it fails with **`redirect_uri_mismatch`**, the
URI in Google (step B5) doesn't exactly match Supabase's callback URL - re-copy it, including
`https://` and the trailing `/auth/v1/callback`.

**D. "To continue to `xxxx.supabase.co`" instead of your app name.**

Google's account picker shows the domain of the OAuth callback, and with Supabase's built-in
provider that callback lives on `<project-ref>.supabase.co` - not a domain you own - so Google
falls back to showing that URL. To improve it:

1. In **Google Auth Platform -> Branding**, set the **App name** to `SubTraq`, add the logo and
   support email, then under **Audience** click **Publish app** (move it out of Testing). A
   published, branded consent screen shows your name/logo on the main dialog.
2. The **"to continue to ..."** line, however, keeps showing `supabase.co` until the callback
   is on a domain you own. Two ways to get your own domain there:
   - **Supabase Custom Domain** (paid add-on): point auth at `auth.yourdomain.com`, add that
     callback URL to the Google client, and the picker shows your domain.
   - **Google ID-token flow** (free, code change): use Google Identity Services on your own
     site and `supabase.auth.signInWithIdToken(...)` instead of the redirect flow, so the
     consent is initiated from your domain with your branding. This is a bigger change to the
     login page; ask if you want it wired up.

For a personal/side project, publishing the branded consent screen (step 1) is usually enough;
the `supabase.co` line is cosmetic and doesn't affect functionality.

---

## 6. Deploy (Netlify)

The repo ships with a `netlify.toml`, so importing it is the whole setup. The build
command, the official Next.js runtime (which turns the AI API route into a serverless
function), and the Node version are already configured. **The only thing you add by hand
is environment variables.**

1. Push the project to a GitHub repository.
2. Go to https://app.netlify.com/, click **Add new site -> Import an existing project**,
   pick your Git provider, and select the repo. Netlify reads `netlify.toml` and
   auto-detects Next.js, so leave the build settings as-is and click **Deploy**.
3. Add your environment variables in **Site configuration -> Environment variables**
   (the same keys from your `.env.local`):
   - `GEMINI_API_KEY` (optional, for the AI panel)
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (optional, for accounts)
   - `NEXT_PUBLIC_SITE_URL` set to your site URL, e.g. `https://subtraq.yodkwtf.com`
4. Trigger a redeploy (**Deploys -> Trigger deploy -> Deploy site**) so the new env vars
   are baked in. If you added them before the first deploy, you can skip this.
5. **After it's live, point Supabase at your real URL** - update the Site URL, redirect
   allowlist, and email confirmation so logins and confirmation emails don't bounce back to
   localhost. See **6.1** below. (Skip if you're not using accounts.)

> The app works on Netlify with no env vars at all (guest mode only). Add the keys above
> to unlock AI Insights and real accounts.
>
> Do **not** add `output: "export"` to `next.config.mjs` for Netlify: static export would
> disable the API routes (AI + FX serverless functions). The default build is correct.

### 6.1 Production auth settings (do this after your first deploy)

Everything in section 5 was set for `http://localhost:3000`. Once the site is live at your
real URL (e.g. `https://subtraq.yodkwtf.com`), point Supabase and Google at it, or logins and
confirmation emails will still send people to localhost.

1. **Site URL + redirects (Supabase).** Open **Authentication -> URL Configuration**:
   - Set **Site URL** to your deployed URL, e.g. `https://subtraq.yodkwtf.com`. Supabase uses
     this as the base for confirmation-email links and as the default post-login redirect, so
     this is the single most important change.
   - Under **Redirect URLs**, **+ Add URL** `https://subtraq.yodkwtf.com/**` (keep the
     `http://localhost:3000/**` entry too if you still develop locally). The app returns users
     to `/dashboard`, which the `/**` wildcard covers.

2. **Confirm email (Supabase).** Open **Authentication -> Sign In / Providers -> Email**:
   - For a public deployment, turn **Confirm email ON** so new users verify via a link before
     their first sign-in. The link uses your **Site URL** from step 1, so set that first or
     the link lands on localhost.
   - Important: Supabase's built-in email sender is heavily **rate-limited** (a few
     messages/hour) and meant only for testing. For anything real, add your own SMTP under
     **Authentication -> Emails -> SMTP Settings** (e.g. Resend, SendGrid, Mailgun, Postmark).
   - Prefer instant sign-up with no inbox step? Leave **Confirm email OFF** - fine for a
     personal/demo app.

3. **Google sign-in for production.** The Supabase **callback URL** doesn't change, so you
   normally don't need a new redirect URI in Google. Just make sure your production URL is in
   Supabase's **Redirect URLs** (step 1). If you added **Authorized JavaScript origins** in
   Google (5.6 B5), add your production origin (`https://subtraq.yodkwtf.com`) there too. If
   your Google consent screen is still in **Testing**, only your **Test users** can sign in -
   click **Publish app** in Google to open it to everyone.

4. **Netlify env vars.** Under **Site configuration -> Environment variables**, confirm
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`
   (set to your domain), and `GEMINI_API_KEY` are present, then **Deploys -> Trigger deploy**
   so the `NEXT_PUBLIC_*` values are baked into the new build.

---

## 7. Features that need no setup

These work as soon as the app runs - nothing to configure:

- **Multi-currency totals.** Each subscription keeps its own currency; the dashboard and
  analytics convert everything into your **default currency** (Settings -> Preferences) so
  totals add up correctly. Rates come from a free, key-less API via `app/api/fx`, cached for
  12 hours, with bundled fallback rates if the network is unavailable.
- **Renewal reminders.** Turn on **Settings -> Preferences -> Renewal reminders**. The
  browser asks for notification permission, then SubTraq notifies you about renewals within
  your threshold while the app is open (once per subscription per day).
  - True email / closed-app push needs an external mail or push service plus a scheduler
    (e.g. a cron job hitting an email provider). That backend is intentionally out of scope
    for this client-only app; the in-app reminder above covers the no-server case.
- **Install as an app (PWA).** A web manifest and service worker ship with the app, so
  supported browsers offer **Install** and the app works offline for already-visited pages.
  The service worker only registers in a production build (`npm run build && npm start`),
  not in `npm run dev`.

---

## 8. Troubleshooting

| Symptom                                        | Fix                                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Dev note about Supabase keys on the login page | Shown in development only. Add `NEXT_PUBLIC_SUPABASE_*` and restart, or ignore it and use guest mode. |
| Sign-up succeeds but can't sign in             | "Confirm email" is on: check your inbox, or disable it (step 5.4).                                    |
| Google button does nothing or errors           | Enable the Google provider in Supabase and add the callback + redirect URLs (step 5.6).               |
| AI buttons say key not configured              | Add `GEMINI_API_KEY` to `.env.local` and restart.                                                     |
| Data not syncing                               | Confirm the SQL in 5.3 ran and the RLS policy exists. Check the browser console for Supabase errors.  |
| Renewal notifications never appear             | Allow notifications for the site in your browser, keep the toggle on, and keep a tab open.            |
| Totals look off across currencies              | They're converted to your default currency; rates are approximate. Check `app/api/fx` is reachable.   |
| Social preview image is blank                  | Set `NEXT_PUBLIC_SITE_URL` and redeploy. The image is the static `public/og-image.png`.               |

---

## 9. Where things live

```
app/                  routes
  (app)/              protected app (dashboard, subscriptions, analytics, settings)
  login/              sign in / sign up / guest
  page.tsx            public landing page
  api/ai-suggest/     AI cancellation suggestions
  api/ai-ask/         AI free-form Q&A about your subscriptions
  api/ai-categorize/  AI category + cycle guess for the Add form
  api/fx/             exchange rates (cached, with fallback)
  manifest.ts         PWA web manifest        robots.ts / sitemap.ts  SEO
components/auth/      auth context, route gate, cloud sync
components/fx-rates-loader.tsx     background FX refresh
components/renewal-reminders.tsx   browser renewal notifications
components/sw-register.tsx         service-worker registration (prod only)
public/sw.js          offline service worker
public/og-image.png   1200x630 social image
lib/supabase.ts       Supabase client (null when unconfigured)
lib/cloud.ts          load/save the per-user JSON blob
lib/fx.ts             currency conversion + fallback rates
lib/store.ts          Zustand store (local cache + guest storage)
```
