'use client'

import { useI18n } from '@/i18n/client'

export function Features() {
	const { t } = useI18n()

	const features = [
		{
			title: t('features.ai.title'),
			description: t('features.ai.description'),
			icon: '📝',
		},
		{
			title: t('features.social.title'),
			description: t('features.social.description'),
			icon: '📱',
		},
		{
			title: t('features.analytics.title'),
			description: t('features.analytics.description'),
			icon: '📊',
		},
	]

	return (
		<section className="py-20 bg-base-100">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-12">
					{t('features.heading')}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{features.map((f) => (
						<div key={f.title} className="card bg-base-200 p-8 text-center">
							<div className="text-4xl mb-4">{f.icon}</div>
							<h3 className="text-xl font-semibold mb-2">{f.title}</h3>
							<p className="text-base-content/70">{f.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
