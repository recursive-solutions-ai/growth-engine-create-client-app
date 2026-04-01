'use client'

import { useI18n } from '@/i18n/client'

export default function LegalPage() {
	const { t, locale } = useI18n()

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-4xl font-bold mb-8">{t('page.terms.of.service')}</h1>
			<div className="prose max-w-none">
				<p>
					These Terms of Service govern your use of this website. By accessing
					or using the site, you agree to be bound by these terms.
				</p>

				<h2>Use of Service</h2>
				<p>
					You agree to use this website only for lawful purposes and in
					accordance with these terms. You are responsible for ensuring that
					your use complies with all applicable laws and regulations.
				</p>

				<h2>Intellectual Property</h2>
				<p>
					All content on this website, including text, images, and logos, is
					the property of the site owner and is protected by applicable
					intellectual property laws.
				</p>

				<h2>Disclaimer</h2>
				<p>
					This website is provided &quot;as is&quot; without warranties of any kind,
					either express or implied.
				</p>

				<h2>Contact</h2>
				<p>
					If you have questions about these terms, please visit our{' '}
					<a href={`/${locale}/contact`}>contact page</a>.
				</p>
			</div>
		</main>
	)
}
