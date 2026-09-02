import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	getBlogPost,
	getBlogAuthorById,
	getBlogTopicsForPost,
	getBookingCallToAction,
	getBusinessConfig,
	getRelatedPosts,
} from '@growth-engine/sdk-server'
import { BlogContent, RelatedArticles, TopicChips } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb, safeQuery } from '@/lib/db'
import { formatDate, localePrefix, localizedPath } from '@/lib/i18n-utils'
import { buildUrl } from '@/lib/sitemap-shared'
import { buildPageMetadata } from '@/lib/seo'
import { AuthorByline } from '@/components/blog/AuthorByline'

export const revalidate = 120

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
	const { locale, slug } = await params
	const post = await safeQuery(null, () => getBlogPost(getDb(), slug, locale))
	if (!post) return {}
	return buildPageMetadata({
		path: `/blog/${slug}`,
		locale,
		title: post.seoTitle ?? post.title,
		description: post.seoDesc,
		image: post.heroImageUrl,
		type: 'article',
	})
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { locale, slug } = await params
	const dict = await getDictionary(locale)

	const post = await safeQuery(null, () => getBlogPost(getDb(), slug, locale))
	if (!post) notFound()

	// Related posts, topic hubs and the booking destination are all computed by
	// the SDK from stored data — deterministic, no curation — so every post
	// links out to 3–5 siblings and up to its pillar page(s) in server HTML.
	const [relatedPosts, topics, bookingCta, author, business] = await Promise.all([
		safeQuery([], () => getRelatedPosts(getDb(), post, { locale })),
		safeQuery([], () => getBlogTopicsForPost(getDb(), post)),
		safeQuery(null, () => getBookingCallToAction(getDb())),
		post.authorId
			? safeQuery(null, () => getBlogAuthorById(getDb(), post.authorId!))
			: Promise.resolve(null),
		safeQuery(null, () => getBusinessConfig(getDb())),
	])

	const date = formatDate(post.createdAt, locale)

	return (
		<main className="container mx-auto px-4 py-12">
			<nav className="mb-8">
				<Link href={localizedPath('/blog', locale)} className="text-sm text-primary hover:underline">
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
					canonicalUrl={buildUrl(`/blog/${slug}`, locale)}
					{...(author ? { author } : {})}
					{...(business ? { business } : {})}
				/>

				<TopicChips
					topics={topics}
					locale={locale}
					localePrefix={localePrefix(locale)}
					label={dict['blog.filed.under']}
					showCounts={false}
					className="mt-10"
				/>
			</article>

			<div className="max-w-5xl mx-auto">
				<RelatedArticles
					posts={relatedPosts}
					locale={locale}
					localePrefix={localePrefix(locale)}
					heading={dict['blog.related.posts']}
					cta={bookingCta}
					ctaLabel={dict['blog.cta.book.call']}
					ctaDescription={dict['blog.cta.book.call.description']}
				/>
			</div>
		</main>
	)
}
