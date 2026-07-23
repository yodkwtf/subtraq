## Todos

#### Features

- [x] Change the default currency to INR everywhere on the app (for all screens, all components, all mockups, and all the data). Make sure to change the currency symbol to ₹ as well.
- [x] Add more currencies to choose for default currency (also add country flags for each currency)
- [x] Add condition to prevent duplicate subscriptions
- [x] The app is called "SubTraq". Change all the branding to "SubTraq" (including the app name, logo, and everywhere else in the app)
- [x] Update the meta tags for all the pages to make it very SEO friendly (including the title, description, and other important meta tags)
- [x] Create an opengraph image for the app and add it to the meta tags for all the pages (1200x630px, 1.91:1 ratio, PNG format). The image should match the branding of the app and should be visually appealing. It should also include the app name and logo in a prominent way. - Image exists (1200x630). Fixed the broken share preview: the landing page was overriding `openGraph` without re-declaring the image, and `metadataBase` fell back to localhost on Netlify. Now the landing page declares the og:image + twitter image, and the base falls back to the Netlify URL.
- [x] Change the logo and favicon to match the branding of the app (SubTraq)
- [x] On the settings page, changing preferences doesn't show toast messages.
- [x] Make sure all the money related updates are reflected actually and not just for mockup. (confirm) - Confirmed: all amounts are real, persisted state (Zustand `persist` for guests, Supabase cloud row for signed-in users). Add/edit/delete/pause and currency/FX changes all update the live store, not mock data.
- [x] For the brands where there icon isnt available,use uncolored icons of those. For eg, you said amazon icon isn't available, but there are versions available when I check react-icons library.
- [x] Also, I don't want the wide hyphen "-" anywhere on the app that is usually given by AI tools.
- [x] Implement lightweight auth flow in the app so each user can have their own version of the app with their own data.
- [x] For data storage, use a lightweight DB. This won't be a production app, it's just a fun little side project/product for me which may not have a lot users. Try Supabase if that fits well otherwise pick something yourself.
- [x] Since we'll have a auth signin/signup, we'll need a nice looking landing page since all the current pages become protected. So create that following the same look and feel but should be very modern looking.
- [x] Also have a guest login with mock data for people to play around and test the app as not everyone likes to login. Obv the guests login people would not have all the rights.
- [x] Do a thorough testing of the app and make sure that everything that you'd expect to work, does work and there are no bugs here and there.
- [x] After login, the settings and preferences should also have some user related configurations as well like name and other common stuff.
- [x] Add more categories for subscriptions
- [x] For all the stuff that needs some setup from my side like secret keys, etc., prepare a step by step instructions for the setup with the latest versions so there's no outdated issue and put all this in a new file guide.md. They should as detailed as possible.
- [x] Also update the project readme as well.
- [x] List down the next steps as a separate section in this file. Do not modify any item already present here. Only I will mark them once I finish my testing.
- [x] Lets also have a search bar in the category dropdown if that's a good UX. Up to you based on how other apps have it
- [x] Google sign-in (Supabase supports it; only email/password wired up). - Google OAuth wired via Supabase `signInWithOAuth`; the "Continue with Google" button is always visible on /login (GitHub removed per request). It activates once Supabase + the Google provider are configured (guide.md 5.6).
- [x] Multi-currency totals with live FX conversion (amounts are currently shown per their own currency). If I change the default currency, it should not affect the math calculations - Every on-screen amount (cards, slide-over, upcoming, analytics, totals) is converted to your default currency via live `/api/fx` rates (cached, offline fallback) through `useDisplayCurrency`. Each sub still _stores_ its own currency (edited in that currency in the form); changing the default only changes display, never the stored amount.
- [x] PWA / installable app + offline-first polish. - manifest.webmanifest + offline service worker were present; added the 192/512 PNG + maskable icons Chrome requires for the install prompt. The service worker registers in production only, so test with `npm run build && npm start` (dev shows no install prompt by design).
- [x] I want some more AI features as the app is called SubTraq. Think of some use cases and implement them in the app. Make sure everything is up and running and there are no bugs and document all the setup steps required from my side in guide.md.
- [x] Improve the readme to remove irrelevant info and keep it professional and improve the setup section as well to provide step by step instructions.

#### Bug Fixes

- [x] There is a slight glitch of the icons when we switch from grid to list view and vice versa. Fix that glitch.
- [x] When I'm adding a subscription, the default cycle is monthly and so the renewal date is set to 1 month from the current date. But when I change the cycle to yearly, the renewal date is still set to 1 month from the current date. It should be set to 1 year from the current date when I change the cycle to yearly. Fix this issue. Same for quarterly.
- [x] Go through all the files one by one and check for typescript or linting issues and fix them. Then check those files again as sometimes the issues do not get fixed. And once it's fixed and nothing is breaking only then proceed. - `tsc --noEmit` and `next build` (type + lint) both pass clean.
- [x] Remove all the unnecessary comments from everywhere. Only add comments where absolutely needed. - Reviewed; remaining comments explain non-obvious "why" (scroll-lock, FX normalization, Windows flags). No redundant/noise comments found.
- [x] The country flags against the currency are not working on Windows - Now rendered as SVG flags (flagcdn) instead of emoji, so they show on every OS.
- [x] Check if the `add` page is being used anywhere
- [x] Same brand icon is being used for Amazon, Amazon Music, and Amazon Prime video, see if that can be fixed. Same for Microsoft and Microsoft 365. Also Amazon Prime Video or Prime Video.
- [x] Fix the scroll for the brand icons tab. Not able to scroll right now, there is a lag. - Root cause: the dialog's scroll-lock (react-remove-scroll) blocked the portaled popover. Popovers/selects now portal into the dialog subtree so their lists scroll; off-screen icons already use CSS containment for smoothness.
- [x] There's a weird "Skip to content" button floating on the top left side
- [x] why are we showing "Accounts need a quick Supabase setup (see guide.md). You can still explore everything as a guest below." on the signup/signin pages if they are public facing pages - This note now only renders in development (`NODE_ENV === "development"`) and only when Supabase isn't configured, so public visitors never see it.
- [x] When I go to dashboard in guest mode, then when I try to move back to signup/signin page, it keeps redirecting to dashboard page in guest mode
- [x] For the email field, when you first enter with "@" it gives you a warning but then that warning keeps appearing at each keypress; should only show on incorrect submission - Validation now runs only on submit; typing in a field clears its error instead of re-validating on every keypress.
- [x] I am not sure so I want help in understanding if allowing future date for start date of a subscription makes sense or not - Decision: keep future start dates disallowed (enforced via `max=today` + validation). A "start date" is when you first subscribed, so it's always today or earlier; allowing future dates would also break spend-history/"longest held" analytics that assume start ≤ now. Use the renewal date for upcoming billing instead.
- [x] Also the end date should not be less than start date - Added validation (and a `min` on the date picker) so the next-renewal date can't be earlier than the start date.

- [x] the scroll is not working while choosing the icons or while choosing the category when new subscription add popup is open - Fixed together with the brand-icons scroll: popovers/selects now portal into the dialog so the dialog's scroll-lock no longer blocks them.
- [x] The create an account link on guest view banner is taking to login view and not the signup view - Banner now links to `/login?mode=signup`; the login page opens in sign-up mode when that param is present.
- [x] The banner on guest mode is also not very visible in the light mode. Fix that and check for same colors across the app to handle the visibility on light mode. - Banner and all amber/red/emerald accents now use a `text-*-600 dark:text-*-400` pattern so they stay legible in both themes.

#### Next steps

> Added for you to verify/decide after your own testing. Nothing here is started.

**Setup to do on your side (see `guide.md` for full steps)**

- [x] Add `ANTHROPIC_API_KEY` to `.env.local` to enable the AI Insights panel.
- [x] Create a free Supabase project, run the SQL in `guide.md` (table + RLS), and add `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to enable real accounts + cloud sync.
- [x] In Supabase, turn off "Confirm email" for quick testing (or keep it on for production).
- [x] Set `NEXT_PUBLIC_SITE_URL` before deploying so SEO/Open Graph links are absolute.

**Verify during testing**

- [x] Guest mode: lands on the marketing page, "Continue as guest" loads sample data, guest banner shows, profile editing is gated.
- [x] Auth: sign up, sign out, sign back in; data persists and syncs across two browsers.
- [x] Currency switch updates every amount across dashboard, subscriptions, analytics, and the slide-over.
- [x] Adding a subscription with a duplicate name is blocked with a toast.
- [x] Changing the billing cycle (or start date) moves the renewal date correctly.
- [x] Brand picker scrolls smoothly; grid⇄list toggle no longer glitches the icons.
- [x] Amazon (and other uncolored brands) show a logo instead of a monogram.

**Possible future enhancements (not built)**

- [ ] Email/push renewal reminders (currently in-app urgency only).
