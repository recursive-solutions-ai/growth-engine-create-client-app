'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'
import { formatDate } from '@/lib/i18n-utils'

interface BlogCardProps {
	slug: string
	title: string
	content: string
	heroImageUrl: string | null
	seoDesc: string | null
	createdAt: Date | string
}

export function BlogCard({ slug, title, content, heroImageUrl, seoDesc, createdAt }: BlogCardProps) {
	const { locale } = useI18n()
	const date = formatDate(createdAt, locale)
	const preview = seoDesc ?? content.replace(/<[^>]*>/g, '').slice(0, 160) + '...'

	return (
		<Link href={`/${locale}/blog/${slug}`} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
			{heroImageUrl && (
				<figure className="aspect-video overflow-hidden">
					<img
						src={heroImageUrl}
						alt={title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</figure>
			)}
			<div className="card-body">
				<time className="text-xs text-base-content/50">{date}</time>
				<h2 className="card-title text-lg group-hover:text-primary transition-colors">{title}</h2>
				<p className="text-sm text-base-content/70 line-clamp-3">{preview}</p>
			</div>
		</Link>
	)
}
