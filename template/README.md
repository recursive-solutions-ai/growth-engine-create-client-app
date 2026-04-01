# {{CLIENT_NAME}}

Built with [Growth Engine](https://github.com/recursive-solutions-ai).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Set these in `.env.local` (never commit this file):

```
BRAIN_API_URL=http://localhost:3000
BRAIN_API_KEY=brain_live_...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...
```

| Variable | Purpose |
|----------|---------|
| `BRAIN_API_URL` | URL of the Brain instance (`http://localhost:3000` for dev, production URL for prod) |
| `BRAIN_API_KEY` | API key for authenticating with the Brain |
| `TURSO_DATABASE_URL` | Your Turso SQLite database URL |
| `TURSO_AUTH_TOKEN` | Auth token for your Turso database |

All four are server-only — do **not** prefix with `NEXT_PUBLIC_`.

| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | _(optional)_ Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). No tracking if omitted |

## Project Structure

| Path | Purpose |
|------|---------|
| `src/app/api/rs/[...route]/route.ts` | SDK route handler — connects to Brain and Turso |
| `src/app/layout.tsx` | Root layout with `GrowthEngineProvider` |
| `src/app/page.tsx` | Landing page with latest blog posts |
| `src/app/blog/` | Blog listing and detail pages |
| `src/components/` | Reusable UI components |
| `next.config.ts` | Next.js config with `serverExternalPackages` |

## Forms

Forms are defined in the Brain portal and can be used on your client site with type-safe schemas.

### Pull form definitions

Run this whenever forms are created or updated in the Brain portal:

```bash
npm run pull-forms
```

This generates `src/generated/forms.ts` with Zod schemas, TypeScript types, and slug constants for each form. Commit this file so other developers get the types immediately.

### Using forms in your components

```tsx
import { useForm, submitForm } from '@growth-engine/sdk-client'
import { contactFormSchema, FormSlugs } from '@/generated/forms'
import type { ContactFormData } from '@/generated/forms'

function ContactForm() {
  // useForm returns runtime schema + form definition
  const { form, schema, loading } = useForm(FormSlugs.contactForm)

  async function handleSubmit(data: ContactFormData) {
    // submitForm validates against the schema before sending
    const result = await submitForm(FormSlugs.contactForm, data)
    if (!result.ok) console.error(result.error)
  }

  // Render your form using form.fields for labels, types, etc.
}
```

### Custom output path

```bash
npx growth-engine-pull-forms --output src/types/forms.ts
```

## SDK Reference

| Hook / Function | What it does |
|---|---|
| `useContent('blog')` | Fetches blog posts from your Turso DB |
| `useBusinessConfig()` | Fetches business config from your Turso DB |
| `useForms()` | Fetches all active forms |
| `useForm(slug)` | Fetches a form definition with Zod schema |
| `submitForm(slug, data)` | Validates and submits form data |
| `triggerBlogGen({ topic })` | Triggers AI blog generation via the Brain |
| `triggerSocialSync()` | Triggers social media sync via the Brain |
| `useJobStatus(jobId)` | Polls job progress |
| `useSDKStatus()` | Checks SDK version compatibility |

## Google Analytics

Analytics is built in but only activates when you set a GA4 Measurement ID.

### Enable tracking

Add your Measurement ID to `.env.local`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

If this variable is not set, no analytics scripts are loaded — zero overhead.

### Built-in events

These events are tracked automatically:

| Event | Trigger | Description |
|-------|---------|-------------|
| `cta_click` | User clicks the CTA button | Measures call-to-action engagement |
| `contact_view` | User visits the contact page | Measures contact page interest |

### Custom event tracking

Use the `trackEvent` helper to track additional events in your components:

```tsx
import { trackEvent } from '@/components/analytics/GoogleAnalytics'

// Track a form submission
async function handleSubmit(data: FormData) {
  const result = await submitForm('contact', data)
  if (result.ok) {
    trackEvent('form_submit', { form_slug: 'contact' })
  }
}

// Track any custom event
trackEvent('newsletter_signup', { source: 'footer' })
```

`trackEvent` is safe to call even when GA is not configured — it does nothing if the GA script hasn't loaded.

### Viewing events in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate to **Reports > Engagement > Events**
3. Your custom events (`cta_click`, `contact_view`, `form_submit`, etc.) will appear alongside standard GA4 events

## Deploying to Vercel

1. Push this repo to GitHub
2. Import in Vercel
3. Add the four environment variables in project settings (use your production Brain URL for `BRAIN_API_URL`)
4. Deploy

## Updating the SDK

```bash
npm install github:recursive-solutions-ai/growth-engine-sdk-client#sdk-vLATEST
npm install github:recursive-solutions-ai/growth-engine-sdk-server#sdk-vLATEST
```

Check `useSDKStatus()` or the Brain admin portal for the latest version.

## Creating a New Client Site

To scaffold another site like this one:

```bash
npx --package=github:recursive-solutions-ai/growth-engine-create-client-app -- create-client-app
```
