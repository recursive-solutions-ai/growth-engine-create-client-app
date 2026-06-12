import { getBusinessConfig } from '@growth-engine/sdk-server'
import { BusinessJsonLd } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { supportedLocales } from '@/i18n/config'
import { getDb, safeQuery } from '@/lib/db'
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
	const business = await safeQuery(null, () => getBusinessConfig(getDb()))

	return (
		<>
			{/* Site-wide Organization / LocalBusiness structured data */}
			{business && <BusinessJsonLd config={business} />}
			<Header dict={dict} locale={locale} />
			<main className="flex-1">{children}</main>
			<Footer dict={dict} locale={locale} />
		</>
	)
}
