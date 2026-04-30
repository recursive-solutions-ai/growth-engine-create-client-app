import Link from 'next/link'
import { getBlogPosts } from '@growth-engine/sdk-server'
import { BlogCard } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { getDb } from '@/lib/db'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'

export const revalidate = 60

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const dict = await getDictionary(locale)
	const db = getDb()
	const posts = await getBlogPosts(db, { locale, limit: 3 })

	return (
		<>
			<Hero dict={dict} locale={locale} />
			<Features dict={dict} />

			<section className="py-20 bg-base-100">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-10">
						<h2 className="text-3xl font-bold">{dict['home.latest.blog']}</h2>
						<Link href={`/${locale}/blog`} className="btn btn-ghost btn-sm">
							{dict['home.view.all']} →
						</Link>
					</div>

					{posts.length === 0 ? (
						<p className="text-center text-base-content/50 py-12">
							{dict['home.no.posts']}
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{posts.map((post) => (
								<BlogCard
									key={post.id}
									slug={post.slug}
									title={post.title}
									content={post.content}
									heroImageUrl={post.heroImageUrl}
									seoDesc={post.seoDesc}
									createdAt={post.createdAt}
									locale={locale}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			<CTA dict={dict} locale={locale} />
		</>
	)
}
