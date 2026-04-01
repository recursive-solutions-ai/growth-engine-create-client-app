'use client'

import { useState, useMemo } from 'react'
import { useI18n } from '@/i18n/client'
import { BlogCard } from './BlogCard'
import { BlogSearch } from './BlogSearch'

interface BlogPost {
	id: string
	slug: string
	title: string
	content: string
	heroImageUrl: string | null
	seoDesc: string | null
	createdAt: Date | string
}

const POSTS_PER_PAGE = 9

export function BlogList({ posts }: { posts: BlogPost[] }) {
	const { t } = useI18n()
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)

	const filtered = useMemo(() => {
		if (!search.trim()) return posts
		const q = search.toLowerCase()
		return posts.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				(p.seoDesc && p.seoDesc.toLowerCase().includes(q)),
		)
	}, [posts, search])

	const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
	const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

	return (
		<div>
			<BlogSearch value={search} onChange={(v) => { setSearch(v); setPage(1) }} />

			{paginated.length === 0 ? (
				<div className="text-center py-16 text-base-content/50">
					<p className="text-lg">{t('blog.no.posts')}</p>
					{search && (
						<button
							onClick={() => setSearch('')}
							className="btn btn-ghost btn-sm mt-2"
						>
							{t('blog.clear.search')}
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{paginated.map((post) => (
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

			{totalPages > 1 && (
				<div className="flex justify-center mt-8">
					<div className="join">
						<button
							className="join-item btn btn-sm"
							disabled={page <= 1}
							onClick={() => setPage(page - 1)}
						>
							«
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
								onClick={() => setPage(p)}
							>
								{p}
							</button>
						))}
						<button
							className="join-item btn btn-sm"
							disabled={page >= totalPages}
							onClick={() => setPage(page + 1)}
						>
							»
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
