import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getBlogPosts, getBlogAuthors } from '@growth-engine/sdk-server'
import { BlogList } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb, safeQuery } from '@/lib/db'
import { BLOG_POSTS_PER_PAGE } from '@/lib/blog-pagination'
import { localePrefix, localizedPath } from '@/lib/i18n-utils'
import { buildPageMetadata } from '@/lib/seo'
import { AuthorChips } from '@/components/blog/AuthorChips'

export const revalidate = 60

// `/blog/page/2`, `/blog/page/3`, … Page 1 lives at `/blog` itself — this
// route 308s `/blog/page/1` there so the listing has exactly one URL per page.
// Pagination links are plain HTML anchors (see BlogList), so crawlers reach
// every page and no post is orphaned behind client-side state.

function parsePageNumber(raw: string): number | null {
	if (!/^\d+$/.test(raw)) return null
	const n = Number(raw)
	return Number.isSafeInteger(n) && n >= 1 ? n : null
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; pageNumber: string }>
}): Promise<Metadata> {
	const { locale, pageNumber } = await params
	const page = parsePageNumber(pageNumber)
	if (!page) return {}
	const dict = await getDictionary(locale)
	const pageLabel = dict['blog.pagination.page'].replace('{page}', String(page))
	return buildPageMetadata({
		path: `/blog/page/${page}`,
		locale,
		title: `${dict['blog.heading']} · ${pageLabel}`,
		description: dict['blog.subtitle'],
	})
}

export default async function BlogPaginatedPage({
	params,
}: {
	params: Promise<{ locale: string; pageNumber: string }>
}) {
	const { locale, pageNumber } = await params
	const page = parsePageNumber(pageNumber)
	if (!page) notFound()
	if (page === 1) permanentRedirect(localizedPath('/blog', locale))

	const dict = await getDictionary(locale)

	const [posts, authors] = await Promise.all([
		safeQuery([], () => getBlogPosts(getDb(), { locale, limit: 0 })),
		safeQuery([], () => getBlogAuthors(getDb())),
	])

	const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE))
	if (page > totalPages) notFound()

	return (
		<main className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold text-center mb-2">{dict['blog.heading']}</h1>
			<p className="text-center text-base-content/60 mb-10">
				{dict['blog.subtitle']}
			</p>

			<AuthorChips
				authors={authors}
				locale={locale}
				label={dict['blog.filter.by.author']}
			/>

			<BlogList
				posts={posts}
				locale={locale}
				localePrefix={localePrefix(locale)}
				authors={authors}
				page={page}
				postsPerPage={BLOG_POSTS_PER_PAGE}
				paginationBasePath={localizedPath('/blog', locale)}
				translations={{
					noPostsMessage: dict['blog.no.posts'],
					clearSearchLabel: dict['blog.clear.search'],
					searchPlaceholder: dict['blog.search.placeholder'],
				}}
			/>
		</main>
	)
}
