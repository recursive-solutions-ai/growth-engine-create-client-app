'use client'

import { useI18n } from '@/i18n/client'
import { BlogCard } from './BlogCard'

interface BlogPost {
	id: string
	slug: string
	title: string
	content: string
	heroImageUrl: string | null
	seoDesc: string | null
	createdAt: Date | string
}

export function RelatedPosts({
	posts,
	currentSlug,
}: {
	posts: BlogPost[]
	currentSlug: string
}) {
	const { t } = useI18n()
	const related = posts.filter((p) => p.slug !== currentSlug).slice(0, 3)

	if (related.length === 0) return null

	return (
		<section className="mt-16">
			<h2 className="text-2xl font-bold mb-6">{t('blog.related.posts')}</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{related.map((post) => (
					<BlogCard
						key={post.id}
						slug={post.slug}
						title={post.title}
						content={post.content}
						heroImageUrl={post.heroImageUrl}
						seoDesc={post.seoDesc}
						createdAt={post.createdAt}
					/>
				))}
			</div>
		</section>
	)
}
