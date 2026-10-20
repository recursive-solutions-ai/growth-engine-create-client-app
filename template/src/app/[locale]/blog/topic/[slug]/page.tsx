import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogAuthors, getBlogTopic, getBlogTopics } from '@growth-engine/sdk-server'
import { BlogList, TopicChips } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb, safeQuery } from '@/lib/db'
import { localePrefix, localizedPath } from '@/lib/i18n-utils'
import { buildPageMetadata } from '@/lib/seo'

export const revalidate = 120

// Topic hub (pillar) pages: `/blog/topic/rsu-taxes` lists every published post
// that shares the keyword, so a cluster of posts on one subject has ONE page
// that links to all of them and that all of them link back to. Hubs are
// computed from stored post keywords by `getBlogTopic` — nothing to curate —
// and appear once two posts share a keyword. They are listed in the sitemap
// (`buildTopicEntries`) and linked from the blog index (`<TopicChips>`).

function fill(template: string, values: Record<string, string>): string {
	return Object.entries(values).reduce(
		(text, [key, value]) => text.replace(`{${key}}`, value),
		template,
	)
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
	const { locale, slug } = await params
	const page = await safeQuery(null, () => getBlogTopic(getDb(), slug, locale))
	if (!page) return {}
	const dict = await getDictionary(locale)
	return buildPageMetadata({
		path: `/blog/topic/${page.topic.slug}`,
		locale,
		title: fill(dict['blog.topic.title'], { topic: page.topic.label }),
		description: fill(dict['blog.topic.subtitle'], {
			topic: page.topic.label,
			count: String(page.topic.postCount),
		}),
	})
}

export default async function BlogTopicPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { locale, slug } = await params
	const page = await safeQuery(null, () => getBlogTopic(getDb(), slug, locale))
	if (!page) notFound()

	const dict = await getDictionary(locale)
	const [authors, topics] = await Promise.all([
		safeQuery([], () => getBlogAuthors(getDb())),
		safeQuery([], () => getBlogTopics(getDb(), locale)),
	])

	return (
		<main className="container mx-auto px-4 py-12">
			<nav className="mb-8">
				<Link href={localizedPath('/blog', locale)} className="text-sm text-primary hover:underline">
					← {dict['blog.back']}
				</Link>
			</nav>

			<h1 className="text-4xl font-bold text-center mb-2">
				{fill(dict['blog.topic.title'], { topic: page.topic.label })}
			</h1>
			<p className="text-center text-base-content/60 mb-10">
				{fill(dict['blog.topic.subtitle'], {
					topic: page.topic.label,
					count: String(page.topic.postCount),
				})}
			</p>

			<TopicChips
				topics={topics}
				locale={locale}
				localePrefix={localePrefix(locale)}
				label={dict['blog.topics.label']}
				currentSlug={page.topic.slug}
			/>

			<BlogList
				posts={page.posts}
				locale={locale}
				localePrefix={localePrefix(locale)}
				authors={authors}
				page={1}
				postsPerPage={Math.max(page.posts.length, 1)}
				translations={{
					noPostsMessage: dict['blog.no.posts'],
					clearSearchLabel: dict['blog.clear.search'],
					searchPlaceholder: dict['blog.search.placeholder'],
				}}
			/>
		</main>
	)
}
