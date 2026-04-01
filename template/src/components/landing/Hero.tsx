'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'

export function Hero() {
	const { t, locale } = useI18n()

	return (
		<section className="hero min-h-[60vh] bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-2xl">
					<h1 className="text-5xl font-bold">
						{t('hero.title')}
					</h1>
					<p className="py-6 text-lg text-base-content/70">
						{t('hero.subtitle')}
					</p>
					<div className="flex gap-4 justify-center">
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
