# Growth Engine — Create Client App

CLI scaffolder for Growth Engine client websites.

## Quick Start

```bash
npx --package=github:recursive-solutions-ai/growth-engine-create-client-app -- create-client-app
```

## What it does

Creates a fully configured Next.js project with:
- Growth Engine SDK pre-installed
- Blog, contact, and landing pages
- Tailwind CSS + DaisyUI styling
- API route handler for SDK communication

## Prerequisites

- Node.js >= 20
- Brain API URL and API key (provided by your agency admin)
- Turso database URL and auth token (provisioned during onboarding)

## After scaffolding

```bash
cd your-project
npm install
npm run dev
```