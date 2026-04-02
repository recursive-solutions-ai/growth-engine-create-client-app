'use client'

import { useContent } from '@growth-engine/sdk-client'
import { useI18n } from '@/i18n/client'
import { BlogList } from '@/components/blog/BlogList'

export default function BlogPage() {
	const { t, locale } = useI18n()
	const { posts, loading } = useContent('blog', { locale })

	return (
		<main className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold text-center mb-2">{t('blog.heading')}</h1>
			<p className="text-center text-base-content/60 mb-10">
				{t('blog.subtitle')}
			</p>

			{loading && (
				<div className="flex justify-center py-16">
					<span className="loading loading-spinner loading-lg" />
				</div>
			)}

			{!loading && <BlogList posts={posts} />}
		</main>
	)
}
