import type { MetadataRoute } from 'next'
import { getAiCrawlerRules } from '@growth-engine/sdk-server'

const SITE_URL =
	process.env.SITE_URL ??
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'http://localhost:3000')

// Re-generate every 5 minutes so an AI-crawler policy change made in the
// Growth Engine portal ("Fix it for me" on the AI Search tab) reaches the live
// robots.txt without a redeploy.
export const revalidate = 300

export default async function robots(): Promise<MetadataRoute.Robots> {
	// Explicit per-bot groups for the tenant's AI-crawler policy. Empty when no
	// policy is set (or the Brain is unreachable), keeping the default behavior:
	// allow everything, keep robots out of /api/.
	const aiRules = await getAiCrawlerRules({
		brainApiUrl: process.env.BRAIN_API_URL,
		brainApiKey: process.env.BRAIN_API_KEY,
	})

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api/'],
			},
			...aiRules,
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
	}
}
