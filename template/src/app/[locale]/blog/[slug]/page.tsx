import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	getBlogPost,
	getBlogPosts,
	getBlogAuthorById,
	getBusinessConfig,
} from '@growth-engine/sdk-server'
import { BlogContent, RelatedPosts } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb } from '@/lib/db'
import { formatDate } from '@/lib/i18n-utils'
import { AuthorByline } from '@/components/blog/AuthorByline'

export const revalidate = 120

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { locale, slug } = await params
	const dict = await getDictionary(locale)
	const db = getDb()

	const post = await getBlogPost(db, slug, locale)
	if (!post) notFound()

	const [allPosts, author, business] = await Promise.all([
		getBlogPosts(db, { locale, limit: 0 }),
		post.authorId ? getBlogAuthorById(db, post.authorId) : Promise.resolve(null),
		getBusinessConfig(db),
	])

	const date = formatDate(post.createdAt, locale)

	return (
		<main className="container mx-auto px-4 py-12">
			<nav className="mb-8">
				<Link href={`/${locale}/blog`} className="text-sm text-primary hover:underline">
					← {dict['blog.back']}
				</Link>
			</nav>

			<article className="max-w-3xl mx-auto">
				{post.heroImageUrl && (
					<figure className="aspect-video overflow-hidden rounded-xl mb-8">
						<img
							src={post.heroImageUrl}
							alt={post.title}
							className="w-full h-full object-cover"
						/>
					</figure>
				)}

				<time className="text-sm text-base-content/50">{date}</time>
				<h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>

				{author && (
					<div className="mb-8">
						<AuthorByline author={author} locale={locale} />
					</div>
				)}

				<BlogContent
					html={post.content}
					post={post}
					{...(author ? { author } : {})}
					{...(business ? { business } : {})}
				/>
			</article>

			<div className="max-w-5xl mx-auto">
				<RelatedPosts
					posts={allPosts}
					currentSlug={slug}
					locale={locale}
					heading={dict['blog.related.posts']}
				/>
			</div>
		</main>
	)
}
