'use client'

import Link from 'next/link'
import { useContent } from '@growth-engine/sdk-client'
import { useI18n } from '@/i18n/client'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'
import { BlogCard } from '@/components/blog/BlogCard'

export default function HomePage() {
	const { t, locale } = useI18n()
	const { posts, loading } = useContent('blog', { locale })
	const latestPosts = posts.slice(0, 3)

	return (
		<>
			<Hero />
			<Features />

			<section className="py-20 bg-base-100">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-10">
						<h2 className="text-3xl font-bold">{t('home.latest.blog')}</h2>
						<Link href={`/${locale}/blog`} className="btn btn-ghost btn-sm">
							{t('home.view.all')} →
						</Link>
					</div>

					{loading ? (
						<div className="flex justify-center py-12">
							<span className="loading loading-spinner loading-lg" />
						</div>
					) : latestPosts.length === 0 ? (
						<p className="text-center text-base-content/50 py-12">
							{t('home.no.posts')}
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{latestPosts.map((post) => (
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
					)}
				</div>
			</section>

			<CTA />
		</>
	)
}
