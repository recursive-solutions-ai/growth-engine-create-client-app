'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'
import { useScrollReveal } from '@/hooks/useGsap'

export function Hero() {
	const { t, locale } = useI18n()
	const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 30, duration: 0.7, start: 'top 95%' })
	const subtitleRef = useScrollReveal<HTMLParagraphElement>({ y: 20, delay: 0.15, start: 'top 95%' })
	const ctaRef = useScrollReveal<HTMLDivElement>({ y: 20, delay: 0.3, start: 'top 95%' })

	return (
		<section className="hero min-h-[60vh] bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-2xl">
					<h1 ref={headingRef} className="text-5xl font-bold">
						{t('hero.title')}
					</h1>
					<p ref={subtitleRef} className="py-6 text-lg text-base-content/70">
						{t('hero.subtitle')}
					</p>
					<div ref={ctaRef} className="flex gap-4 justify-center">
						<Link href={`/${locale}/blog`} className="btn btn-primary">
							{t('hero.cta.blog')}
						</Link>
						<Link href={`/${locale}/contact`} className="btn btn-outline">
							{t('hero.cta.contact')}
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
