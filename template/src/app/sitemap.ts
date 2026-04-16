import type { MetadataRoute } from 'next'
import { defaultLocale, supportedLocales, isMultiLang } from '@/i18n/config'

const SITE_URL =
	process.env.SITE_URL ??
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'http://localhost:3000')

const STATIC_PAGES = ['', '/blog', '/contact', '/privacy', '/legal', '/cookies']
const BLOG_BATCH_SIZE = 1000

interface BlogSitemapEntry {
	slug: string
	language: string
	updatedAt: string | null
	parentPostId: string | null
}

function buildUrl(path: string, locale?: string): string {
	if (!locale || locale === defaultLocale) {
		return `${SITE_URL}${path}`
	}
	return `${SITE_URL}/${locale}${path}`
}

function buildAlternates(path: string): Record<string, string> | undefined {
	if (!isMultiLang) return undefined

	const languages: Record<string, string> = {}
	for (const locale of supportedLocales) {
		languages[locale] = buildUrl(path, locale)
	}
	return languages
}

async function fetchBlogCount(): Promise<number> {
	try {
		const res = await fetch(
			`${SITE_URL}/api/rs/content?type=blog&count=true`,
			{ next: { revalidate: 3600 } },
		)
		if (!res.ok) return 0
		const data = (await res.json()) as { count: number }
		return data.count
	} catch {
		return 0
	}
}

async function fetchBlogBatch(
	locale: string,
	limit: number,
	offset: number,
): Promise<BlogSitemapEntry[]> {
	try {
		const res = await fetch(
			`${SITE_URL}/api/rs/content?type=blog&locale=${locale}&limit=${limit}&offset=${offset}&fields=slug,updatedAt,language,parentPostId`,
			{ next: { revalidate: 3600 } },
		)
		if (!res.ok) return []
		return (await res.json()) as BlogSitemapEntry[]
	} catch {
		return []
	}
}

export async function generateSitemaps() {
	const totalCount = await fetchBlogCount()
	const blogSitemapCount = Math.max(1, Math.ceil(totalCount / BLOG_BATCH_SIZE))

	// ID 0 = static pages, IDs 1..N = blog batches
	const ids = [{ id: 0 }]
	for (let i = 1; i <= blogSitemapCount; i++) {
		ids.push({ id: i })
	}
	return ids
}

export default async function sitemap({
	id,
}: {
	id: number
}): Promise<MetadataRoute.Sitemap> {
	// Static pages sitemap
	if (id === 0) {
		const entries: MetadataRoute.Sitemap = []

		for (const page of STATIC_PAGES) {
			const alternates = buildAlternates(page)
			entries.push({
				url: buildUrl(page, defaultLocale),
				changeFrequency: 'monthly',
				priority: page === '' ? 1.0 : 0.7,
				...(alternates ? { alternates: { languages: alternates } } : {}),
			})
		}

		return entries
	}

	// Blog posts sitemap (paginated)
	const offset = (id - 1) * BLOG_BATCH_SIZE
	const allPosts: BlogSitemapEntry[] = []

	// Fetch posts for all locales
	const fetches = supportedLocales.map((locale) =>
		fetchBlogBatch(locale, BLOG_BATCH_SIZE, offset),
	)
	const results = await Promise.all(fetches)
	for (const batch of results) {
		allPosts.push(...batch)
	}

	// Group posts by parentPostId for hreflang alternates
	const translationGroups = new Map<string, BlogSitemapEntry[]>()
	const standalone: BlogSitemapEntry[] = []

	for (const post of allPosts) {
		if (post.parentPostId) {
			const group = translationGroups.get(post.parentPostId) ?? []
			group.push(post)
			translationGroups.set(post.parentPostId, group)
		} else {
			standalone.push(post)
		}
	}

	const entries: MetadataRoute.Sitemap = []
	const processed = new Set<string>()

	// Process translation groups — one entry per post with cross-language alternates
	for (const [_parentId, group] of translationGroups) {
		const alternates: Record<string, string> = {}
		for (const post of group) {
			alternates[post.language] = buildUrl(`/blog/${post.slug}`, post.language)
		}

		for (const post of group) {
			if (processed.has(post.slug)) continue
			processed.add(post.slug)

			entries.push({
				url: buildUrl(`/blog/${post.slug}`, post.language),
				lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
				changeFrequency: 'weekly',
				priority: 0.8,
				...(Object.keys(alternates).length > 1
					? { alternates: { languages: alternates } }
					: {}),
			})
		}
	}

	// Process standalone posts (no translations)
	for (const post of standalone) {
		if (processed.has(post.slug)) continue
		processed.add(post.slug)

		const alternates = isMultiLang
			? { [post.language]: buildUrl(`/blog/${post.slug}`, post.language) }
			: undefined

		entries.push({
			url: buildUrl(`/blog/${post.slug}`, post.language),
			lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
			changeFrequency: 'weekly',
			priority: 0.8,
			...(alternates && Object.keys(alternates).length > 1
				? { alternates: { languages: alternates } }
				: {}),
		})
	}

	return entries
}
