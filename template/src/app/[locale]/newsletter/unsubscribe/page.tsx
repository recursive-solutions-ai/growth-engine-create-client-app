import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsletterUnsubscribe } from '@growth-engine/sdk-client/components'
import { getDictionary } from '@/i18n'
import { localizedPath } from '@/lib/i18n-utils'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params
	const dict = await getDictionary(locale)
	return {
		title: dict['newsletter.unsubscribe.heading'],
		description: dict['newsletter.unsubscribe.subtitle'],
		// Deliberately not in the sitemap and not indexable: an unsubscribe page
		// has no business ranking in search.
		robots: { index: false, follow: false },
	}
}

export default async function NewsletterUnsubscribePage({
	params,
}: {
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const dict = await getDictionary(locale)

	return (
		<main className="container mx-auto px-4 py-16">
			<div className="max-w-lg mx-auto">
				<NewsletterUnsubscribe
					title={dict['newsletter.unsubscribe.heading']}
					description={dict['newsletter.unsubscribe.subtitle']}
					buttonLabel={dict['newsletter.unsubscribe.button']}
					placeholder={dict['newsletter.signup.placeholder']}
					successMessage={dict['newsletter.unsubscribe.success']}
					successHint={dict['newsletter.unsubscribe.successHint']}
				/>

				<p className="mt-6 text-center text-sm text-base-content/60">
					<Link href={localizedPath('/newsletter', locale)} className="link">
						{dict['newsletter.back']}
					</Link>
				</p>
			</div>
		</main>
	)
}
