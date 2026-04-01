'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchBlog, useContent } from '@growth-engine/sdk-client'
import type { BlogPost } from '@growth-engine/sdk-client'
import { useI18n } from '@/i18n/client'
import { formatDate } from '@/lib/i18n-utils'
import { BlogContent } from '@/components/blog/BlogContent'
import { RelatedPosts } from '@/components/blog/RelatedPosts'

export default function BlogPostPage() {
	const params = useParams<{ locale: string; slug: string }>()
	const { t, locale } = useI18n()
	const [post, setPost] = useState<BlogPost | null>(null)
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)
	const { posts: allPosts } = useContent('blog', { locale })

	useEffect(() => {
		let cancelled = false

		async function load() {
			setLoading(true)
			const result = await fetchBlog(params.slug, locale)
			if (cancelled) return
			if (!result) {
				setNotFound(true)
			} else {
				setPost(result)
			}
			setLoading(false)
		}

		void load()
		return () => { cancelled = true }
	}, [params.slug, locale])

	if (loading) {
		return (
			<main className="container mx-auto px-4 py-12">
				<div className="flex justify-center py-16">
					<span className="loading loading-spinner loading-lg" />
				</div>
			</main>
		)
	}

	if (notFound || !post) {
		return (
			<main className="container mx-auto px-4 py-12 text-center">
				<h1 className="text-4xl font-bold mb-4">{t('blog.post.not.found')}</h1>
				<p className="text-base-content/60 mb-6">
					{t('blog.post.not.found.description')}
				</p>
				<Link href={`/${locale}/blog`} className="btn btn-primary">
					{t('blog.back')}
				</Link>
			</main>
		)
	}

	const date = formatDate(post.createdAt, locale)

	return (
		<main className="container mx-auto px-4 py-12">
			<nav className="mb-8">
				<Link href={`/${locale}/blog`} className="text-sm text-primary hover:underline">
					← {t('blog.back')}
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
				<h1 className="text-4xl font-bold mt-2 mb-8">{post.title}</h1>

				<BlogContent html={post.content} />
			</article>

			<div className="max-w-5xl mx-auto">
				<RelatedPosts posts={allPosts} currentSlug={params.slug} />
			</div>
		</main>
	)
}
