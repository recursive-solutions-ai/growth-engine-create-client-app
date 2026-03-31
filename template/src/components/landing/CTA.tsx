'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'
import { trackEvent } from '@/components/analytics/GoogleAnalytics'

export function CTA() {
	const { t, locale } = useI18n()

	return (
		<section className="py-20 bg-primary text-primary-content">
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-3xl font-bold mb-4">{t('cta.heading')}</h2>
				<p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
					{t('cta.subtitle')}
				</p>
				<Link
					href={`/${locale}/contact`}
					className="btn btn-secondary btn-lg"
					onClick={() => trackEvent('cta_click')}
				>
					{t('cta.button')}
				</Link>
			</div>
		</section>
	)
}
