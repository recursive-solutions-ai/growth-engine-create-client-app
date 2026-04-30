import { getBlogPosts, getBlogAuthors } from '@growth-engine/sdk-server'
import { BlogList } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb } from '@/lib/db'
import { AuthorChips } from '@/components/blog/AuthorChips'

export const revalidate = 60

export default async function BlogPage({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const dict = await getDictionary(locale)
	const db = getDb()

	const [posts, authors] = await Promise.all([
		getBlogPosts(db, { locale, limit: 0 }),
		getBlogAuthors(db),
	])

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
				authors={authors}
				translations={{
					noPostsMessage: dict['blog.no.posts'],
					clearSearchLabel: dict['blog.clear.search'],
					searchPlaceholder: dict['blog.search.placeholder'],
				}}
			/>
		</main>
	)
}
