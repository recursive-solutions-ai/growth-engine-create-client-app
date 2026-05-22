import { getDictionary } from '@/i18n'
import { supportedLocales } from '@/i18n/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export function generateStaticParams() {
	return supportedLocales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const dict = await getDictionary(locale)

	return (
		<>
			<Header dict={dict} locale={locale} />
			<main className="flex-1">{children}</main>
			<Footer dict={dict} locale={locale} />
		</>
	)
}
