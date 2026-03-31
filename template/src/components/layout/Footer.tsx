'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/client'

export function Footer() {
	const { t, locale } = useI18n()
	const year = new Date().getFullYear()

	return (
		<footer className="bg-base-200 border-t border-base-300">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="font-bold text-lg mb-2">{'{{CLIENT_NAME}}'}</h3>
						<p className="text-base-content/60 text-sm">
							{t('footer.powered.by')}
						</p>
					</div>

					<div>
						<h4 className="font-semibold mb-2">{t('footer.navigation')}</h4>
						<nav className="flex flex-col gap-1">
							<Link href={`/${locale}`} className="text-sm text-base-content/60 hover:text-primary">{t('nav.home')}</Link>
							<Link href={`/${locale}/blog`} className="text-sm text-base-content/60 hover:text-primary">{t('nav.blog')}</Link>
							<Link href={`/${locale}/contact`} className="text-sm text-base-content/60 hover:text-primary">{t('nav.contact')}</Link>
						</nav>
					</div>

					<div>
						<h4 className="font-semibold mb-2">{t('footer.legal')}</h4>
						<nav className="flex flex-col gap-1">
							<Link href={`/${locale}/legal`} className="text-sm text-base-content/60 hover:text-primary">{t('footer.legal.notice')}</Link>
							<Link href={`/${locale}/privacy`} className="text-sm text-base-content/60 hover:text-primary">{t('footer.privacy.policy')}</Link>
							<Link href={`/${locale}/cookies`} className="text-sm text-base-content/60 hover:text-primary">{t('footer.cookie.policy')}</Link>
						</nav>
					</div>
				</div>

				<div className="divider" />

				<p className="text-center text-sm text-base-content/50">
					{t('footer.copyright', { year: String(year) })}
				</p>
			</div>
		</footer>
	)
}
