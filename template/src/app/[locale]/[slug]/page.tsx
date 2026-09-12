import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLandingPage, getBusinessConfig } from '@growth-engine/sdk-server'
import { LandingPageContent } from '@growth-engine/sdk-client/components'
import { getDb, safeQuery } from '@/lib/db'
import { buildUrl, SITE_URL } from '@/lib/sitemap-shared'
import { buildPageMetadata } from '@/lib/seo'

// ─── Landing pages (service-in-city money pages) ─────────────────────────────
// Published landing pages live at the ROOT, e.g. /birthday-party-venue-san-marino.
// That is deliberate: a money page competing for "birthday party venue san
// marino" should not be buried under a /services/ prefix that adds nothing for
// the reader and dilutes the URL.
//
// This is the LAST route Next tries. Every static segment (/blog, /contact,
// /forms, /newsletter, …) wins over a dynamic one, so this catches only paths
// nothing else claims — and calls notFound() when no published page owns the
// slug, which is exactly the 404 those paths got before.
//
// DRAFTS NEVER RENDER: `getLandingPage` filters on status = 'published', so a
// page the engine wrote is invisible here until the owner approves it in the
// portal. There is no preview flag, on purpose.

export const revalidate = 300

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
	const { locale, slug } = await params
	const page = await safeQuery(null, () => getLandingPage(getDb(), slug))
	if (!page) return {}
	return buildPageMetadata({
		path: `/${slug}`,
		locale,
		title: page.seoTitle ?? page.title,
		description: page.seoDesc,
		image: page.heroImageUrl,
		type: 'website',
	})
}

export default async function LandingPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { locale, slug } = await params

	const page = await safeQuery(null, () => getLandingPage(getDb(), slug))
	if (!page) notFound()

	const business = await safeQuery(null, () => getBusinessConfig(getDb()))

	return (
		<main className="container mx-auto px-4 py-12">
			<div className="max-w-3xl mx-auto">
				<LandingPageContent
					page={page}
					business={business}
					canonicalUrl={buildUrl(`/${slug}`, locale)}
					siteUrl={SITE_URL}
					{...(business?.name ? { siteName: business.name } : {})}
				/>
			</div>
		</main>
	)
}
