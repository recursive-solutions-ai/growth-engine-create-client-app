'use client'

import { useI18n } from '@/i18n/client'

export default function PrivacyPage() {
	const { t, locale } = useI18n()

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-4xl font-bold mb-8">{t('page.privacy.policy')}</h1>
			<div className="prose max-w-none">
				<p>
					This Privacy Policy describes how we collect, use, and share your
					personal information when you visit this website.
				</p>

				<h2>Information We Collect</h2>
				<p>
					We may collect information you provide directly, such as when you
					fill out a contact form, as well as usage data collected
					automatically through analytics.
				</p>

				<h2>How We Use Your Information</h2>
				<p>
					We use the information we collect to operate and improve our website,
					respond to your inquiries, and analyze how visitors use the site.
				</p>

				<h2>Data Sharing</h2>
				<p>
					We do not sell your personal information. We may share information
					with service providers who help us operate the website.
				</p>

				<h2>Your Rights</h2>
				<p>
					You may request access to, correction of, or deletion of your
					personal data by contacting us through our{' '}
					<a href={`/${locale}/contact`}>contact page</a>.
				</p>
			</div>
		</main>
	)
}
