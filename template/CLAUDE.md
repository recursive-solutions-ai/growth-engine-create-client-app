# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on this client site.

## Project Overview

This is a Next.js 15 client site built on the Growth Engine platform. It connects to the Brain backend via two SDK packages: `@growth-engine/sdk-client` (browser-safe React hooks) and `@growth-engine/sdk-server` (Node.js route handler). All SDK calls flow through `/api/rs/[...route]` which delegates to `GrowthEngineHandler`.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm pull-forms` | Generate form Zod schemas into `src/generated/forms.ts` |

## Tech Stack

- **Framework**: Next.js 15 (React 19, App Router)
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS 4 + DaisyUI 5 component classes
- **Animations**: GSAP 3.12 + ScrollTrigger
- **Validation**: Zod
- **SDK**: `@growth-engine/sdk-client` (browser) + `@growth-engine/sdk-server` (server)

## Code Style

- No semicolons, single quotes, trailing commas
- `import type { ... }` for type-only imports
- Prefix unused vars with `_`
- Use `cn()` from `@/lib/utils` for conditional class names (clsx + twMerge)
- DaisyUI semantic classes (`btn`, `btn-primary`, `card`, `input`, `alert`, `loading`, `navbar`, `hero`, `join`, `form-control`, `label`, `label-text`) over raw Tailwind equivalents for UI elements
- Theme colors via DaisyUI tokens: `base-100`, `base-200`, `base-content`, `primary`, `error`, `success`
- Dark mode via `data-theme="dark"` attribute on `<html>`, toggled by `ThemeToggle` component
- Blog content uses `prose prose-lg` from `@tailwindcss/typography`

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/api/rs/[...route]/route.ts` | SDK route handler — all SDK calls proxy through here |
| `src/app/layout.tsx` | Root layout: `GrowthEngineProvider`, `GoogleAnalytics` |
| `src/app/[locale]/layout.tsx` | Locale layout: passes `dict`/`locale` props to `Header`, `Footer` |
| `src/app/[locale]/page.tsx` | Landing page (Hero, Features, CTA, latest blog posts) |
| `src/app/[locale]/blog/page.tsx` | Blog listing with search + pagination |
| `src/app/[locale]/blog/[slug]/page.tsx` | Blog detail with `fetchBlog()` + `RelatedPosts` |
| `src/app/[locale]/contact/page.tsx` | Contact form using `useForm('contact-form')` |
| `src/app/[locale]/forms/[slug]/page.tsx` | Dynamic form page — renders any form by slug |
| `src/app/[locale]/privacy/page.tsx` | Privacy policy |
| `src/app/[locale]/legal/page.tsx` | Terms of service |
| `src/app/[locale]/cookies/page.tsx` | Cookie policy |
| `src/components/landing/` | Hero, Features, CTA (with scroll reveal animations) |
| `src/components/blog/` | BlogList, BlogCard, BlogContent, BlogSearch, RelatedPosts |
| `src/components/layout/` | Header, Footer, ThemeToggle, LanguageSwitcher |
| `src/components/config/ConfigDisplay.tsx` | Business hours + contact info display |
| `src/components/analytics/GoogleAnalytics.tsx` | GA4 script loader + `trackEvent()` helper |
| `src/hooks/useGsap.ts` | `useScrollReveal()` and `useGsap()` hooks, re-exports `gsap` |
| `src/i18n/config.ts` | `defaultLocale`, `supportedLocales`, `isMultiLang` from env vars |
| `src/i18n/index.ts` | `getDictionary()` server function with caching, `Dictionary` and `DictionaryKey` types |
| `src/i18n/dictionaries/{locale}.ts` | Flat key-value translation dictionaries |
| `src/lib/utils.ts` | `cn()` helper (clsx + twMerge) |
| `src/lib/env.ts` | Runtime env var checker (logs missing vars on startup) |
| `src/lib/i18n-utils.ts` | `formatDate(date, locale)` |
| `src/proxy.ts` | CORS protection for `/api/` + locale detection/routing |
| `src/generated/forms.ts` | Auto-generated form Zod schemas (via `pnpm pull-forms`) |
| `src/app/globals.css` | Tailwind + DaisyUI + typography plugin imports |
| `src/app/sitemap.ts` | Dynamic sitemap with blog pagination + hreflang |
| `src/app/robots.ts` | Robots.txt (allows all, disallows `/api/`) |

## SDK Reference

### sdk-client (browser-safe — only use in `'use client'` components)

| Hook / Function | Signature | Returns |
|---|---|---|
| `useContent` | `useContent('blog', { locale })` | `{ posts, loading, error }` |
| `fetchBlog` | `fetchBlog(slug, locale?)` | `Promise<BlogPost \| null>` — use in `useEffect`, not top level |
| `getBlogUrl` | `getBlogUrl(post)` | URL path string (`/blog/{urlPath or slug}`) |
| `getSocialPosts` | `getSocialPosts(platform)` | `Promise<SocialPost[]>` |
| `useAuthors` | `useAuthors()` | `{ authors, loading, error }` |
| `fetchAuthor` | `fetchAuthor(slug)` | `Promise<BlogAuthor \| null>` |
| `fetchAuthorPosts` | `fetchAuthorPosts(authorSlug, { locale?, limit?, offset? })` | `Promise<BlogPost[]>` |
| `useBusinessConfig` | `useBusinessConfig()` | `{ config, loading, error }` — hours, contact, address, SEO |
| `getHours` | `getHours()` | `Promise<object \| null>` |
| `getContactInfo` | `getContactInfo()` | `Promise<object \| null>` |
| `useForms` | `useForms()` | `{ forms, loading, error }` |
| `useForm` | `useForm(slug)` | `{ form, schema, loading, error }` — schema is a Zod object |
| `submitForm` | `submitForm(slug, data)` | `{ ok, id?, error?, validationErrors? }` |
| `buildFormSchema` | `buildFormSchema(fields)` | `z.ZodObject` from `FormField[]` |
| `pushLead` | `pushLead(data)` | `{ ok, contactId?, existing?, error? }` |
| `triggerBlogGen` | `triggerBlogGen(payload)` | Job response with `jobId` |
| `triggerSocialSync` | `triggerSocialSync(platforms?)` | Job response with `jobId` |
| `useJobStatus` | `useJobStatus(jobId)` | `{ job, loading, error, refresh }` |
| `useSDKStatus` | `useSDKStatus()` | `{ manifest, loading, error }` |
| `onAnalyticsEvent` | `onAnalyticsEvent({ eventType, page?, sessionId? })` | `Promise<void>` |
| `SDK_VERSION` | Constant | Current SDK version string |

### sdk-server (Node.js only — never import in client components)

Used exclusively in `src/app/api/rs/[...route]/route.ts`:

```ts
import { GrowthEngineHandler } from '@growth-engine/sdk-server'
export const { GET, POST } = GrowthEngineHandler({ brainApiUrl, brainApiKey, tursoUrl, tursoAuthToken })
```

This is listed in `serverExternalPackages` in `next.config.ts`.

## i18n

Locale routing uses a `[locale]` segment in all pages under `src/app/[locale]/`.

**How it works:**

- `src/i18n/config.ts` reads `DEFAULT_LANGUAGE` and `ADDITIONAL_LANGUAGES` env vars
- Single-language mode: middleware rewrites all paths to `/{defaultLocale}/...` transparently (no locale in URL)
- Multi-language mode: middleware detects locale from cookie (`ge-locale`) → `?lang=` param → `Accept-Language` header → default, then redirects to `/{locale}/path`

**Using translations in server components (pages and layouts):**

```tsx
import { getDictionary } from '@/i18n'
const dict = await getDictionary(locale)
dict['hero.title']                                    // simple lookup
dict['blog.load.error'].replace('{error}', msg)       // with variable interpolation ({varName} syntax)
```

**Passing translations to child components:**

```tsx
// In a page or layout (server component):
<Hero dict={dict} locale={locale} />
<Footer dict={dict} locale={locale} />
```

**Server-side (layouts):**

```tsx
import { getDictionary } from '@/i18n'
const dict = await getDictionary(locale)
```

**Adding a language:**

1. Create `src/i18n/dictionaries/{code}.ts` exporting a `Dictionary` object with all keys from `en.ts`
2. Add a `case '{code}':` to the switch in `src/i18n/index.ts` `getDictionary()`
3. Set env: `ADDITIONAL_LANGUAGES=fr,{code}`

**Dictionary key convention:** flat dot-separated keys like `'blog.search.placeholder'`. All keys must exist in every dictionary (type-checked via `DictionaryKey` union from `en.ts`).

## Forms

A default "Contact Us" form (slug: `contact-form`) is seeded during onboarding. Two pages use it out of the box:

- `/contact` — dedicated contact page with business info sidebar
- `/forms/[slug]` — dynamic form page that renders any form by slug

**Usage pattern:**

```tsx
const { form, schema, loading } = useForm('contact-form')
// form.fields sorted by field.order, schema is a Zod object for validation
const result = await submitForm('contact-form', formData)
// result: { ok: true, id } | { ok: false, error?, validationErrors? }
```

Form fields must be sorted by `field.order` before rendering: `[...form.fields].sort((a, b) => a.order - b.order)`.

Supported field types: `text`, `email`, `tel`, `textarea`, `select`, `checkbox`, `number`, `url`.

Submissions automatically create CRM contacts (if email/name fields present) and trigger email notifications (if `notifyEmails` configured in form settings). Both are best-effort.

Run `pnpm pull-forms` to generate typed Zod schemas in `src/generated/forms.ts` for compile-time safety.

## Blog

- `useContent('blog', { locale })` fetches all published posts for the current locale
- `fetchBlog(slug, locale?)` fetches a single post — use inside `useEffect`, not at component top level
- `BlogList` handles client-side search filtering + pagination (9 posts per page)
- `BlogContent` renders HTML via `dangerouslySetInnerHTML` with `prose prose-lg` classes
- `RelatedPosts` shows up to 3 posts excluding the current one
- Blog detail page uses `useParams()` to get `slug` and `locale`

## GSAP Animations

Two hooks in `src/hooks/useGsap.ts`:

**`useScrollReveal(options?)`** — attach ref to element, it animates in on scroll:

```tsx
const ref = useScrollReveal<HTMLDivElement>({ y: 40, stagger: 0.15 })
<div ref={ref}>...</div>
```

Options (defaults): `y` (40), `x` (0), `opacity` (0), `duration` (0.8), `delay` (0), `stagger` (none — set to animate children), `start` ('top 85%'), `ease` ('power2.out').

**`useGsap(callback, scope, deps)`** — full GSAP control with auto-cleanup:

```tsx
const container = useRef<HTMLDivElement>(null)
useGsap(() => {
  gsap.from('.card', { opacity: 0, y: 40, stagger: 0.1 })
}, container, [])
```

Import `gsap` and `ScrollTrigger` from `@/hooks/useGsap` (re-exported with plugin registered).

## Analytics

GA4 via `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var. No scripts loaded when unset.

```tsx
import { trackEvent } from '@/components/analytics/GoogleAnalytics'
trackEvent('form_submit', { form_slug: 'contact' })  // no-op when GA not configured
```

Built-in events: `cta_click`, `contact_view`, `contact_form_submit`.

## Environment Variables

| Variable | Required | Scope | Purpose |
|----------|----------|-------|---------|
| `BRAIN_API_URL` | Yes | Server | Brain instance URL |
| `BRAIN_API_KEY` | Yes | Server | API key (`brain_live_...` or `brain_test_...`) |
| `TURSO_DATABASE_URL` | Yes | Server | Client Turso SQLite URL |
| `TURSO_AUTH_TOKEN` | Yes | Server | Turso auth token |
| `SITE_URL` | No | Server | Base URL for sitemap/robots (falls back to Vercel URL) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Client | GA4 measurement ID (`G-XXXXXXXXXX`) |
| `DEFAULT_LANGUAGE` | No | Server | Default locale (default: `en`) |
| `ADDITIONAL_LANGUAGES` | No | Server | Comma-separated locales (e.g. `fr,es,de`) |

The four required vars are server-only. Never prefix them with `NEXT_PUBLIC_`.

## Gotchas

- **sdk-client is browser-only.** Only import `@growth-engine/sdk-client` in `'use client'` components. It uses React hooks internally.
- **sdk-server is server-only.** Listed in `serverExternalPackages` in `next.config.ts`. Never import it in client components.
- **All pages are under `[locale]`.** Even in single-language mode, the file structure uses `src/app/[locale]/`. Middleware handles the rewrite so URLs don't show the locale prefix.
- **`params` is a Promise in Next.js 15.** Always `const { locale } = await params` in layouts and pages.
- **`fetchBlog` is not a hook.** Use it inside `useEffect`, not at component top level. It returns a `Promise<BlogPost | null>`.
- **Form field order matters.** Always sort by `field.order` before rendering: `[...form.fields].sort((a, b) => a.order - b.order)`.
- **DaisyUI 5 class names.** Use DaisyUI component classes (`btn`, `card`, `input`, `alert`, `navbar`, `hero`, `join`, `loading`, `form-control`, `label`, `label-text`), not raw Tailwind equivalents, for UI elements.
- **Tailwind v4 CSS syntax.** `globals.css` uses `@import 'tailwindcss'` and `@plugin 'daisyui'` — not `@tailwind base/components/utilities`.
- **`cn()` for class merging.** Use `cn()` from `@/lib/utils` instead of raw string concatenation when combining conditional classes.
- **Theme uses `data-theme` attribute**, not CSS `prefers-color-scheme`. Toggle is in `ThemeToggle` component, persisted in `localStorage`.

## Common Patterns

**New page:** Create `src/app/[locale]/your-page/page.tsx` as an async server component. Use `getDictionary(locale)` for translations. Add dictionary keys to all locale files. Export `generateMetadata` for SEO.

**New component:** Place in `src/components/{category}/`. Use DaisyUI classes. Accept props — let pages fetch via SDK hooks and pass data down.

**Links between pages:** Always include locale: `` <Link href={`/${locale}/blog`}> ``

**Loading states:** Use DaisyUI spinner: `<span className="loading loading-spinner loading-lg" />`

**Error states:** Use DaisyUI alert: `<div className="alert alert-error"><span>{error}</span></div>`
