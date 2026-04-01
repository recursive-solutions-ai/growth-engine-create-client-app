'use client'

import { useI18n } from '@/i18n/client'

export default function CookiesPage() {
	const { t, locale } = useI18n()

	return (
		<main className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-4xl font-bold mb-8">{t('page.cookie.policy')}</h1>
			<div className="prose max-w-none">
				<p>
					This Cookie Policy explains how we use cookies and similar
					technologies on this website.
				</p>

				<h2>What Are Cookies</h2>
				<p>
					Cookies are small text files stored on your device when you visit a
					website. They help the site remember your preferences and improve
					your experience.
				</p>

				<h2>Cookies We Use</h2>
				<ul>
					<li>
						<strong>Essential cookies:</strong> Required for the website to
						function properly, such as theme preference.
					</li>
					<li>
						<strong>Analytics cookies:</strong> Help us understand how visitors
						interact with the site so we can improve it.
					</li>
				</ul>

				<h2>Managing Cookies</h2>
				<p>
					You can control cookies through your browser settings. Disabling
					cookies may affect the functionality of this website.
				</p>

				<h2>Contact</h2>
				<p>
					If you have questions about our use of cookies, please visit our{' '}
					<a href={`/${locale}/contact`}>contact page</a>.
				</p>
			</div>
		</main>
	)
}
