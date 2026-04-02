'use client'

import Link from 'next/link'
import { useForms } from '@growth-engine/sdk-client'
import { useI18n } from '@/i18n/client'

export default function FormsPage() {
	const { t, locale } = useI18n()
	const { forms, loading, error } = useForms()

	const activeForms = forms.filter((f) => f.status === 'active')

	return (
		<main className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold text-center mb-2">{t('forms.heading')}</h1>
			<p className="text-center text-base-content/60 mb-10">
				{t('forms.subtitle')}
			</p>

			{loading && (
				<div className="flex justify-center py-16">
					<span className="loading loading-spinner loading-lg" />
				</div>
			)}

			{error && (
				<div className="alert alert-error">
					<span>{t('forms.load.error', { error })}</span>
				</div>
			)}

			{!loading && !error && activeForms.length === 0 && (
				<p className="text-center text-base-content/60 py-16">
					{t('forms.empty')}
				</p>
			)}

			{!loading && activeForms.length > 0 && (
				<div className="mx-auto max-w-2xl grid gap-4">
					{activeForms.map((form) => (
						<Link
							key={form.id}
							href={`/${locale}/forms/${form.slug}`}
							className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="card-body">
								<h2 className="card-title">{form.name}</h2>
								{form.description && (
									<p className="text-base-content/60">{form.description}</p>
								)}
							</div>
						</Link>
					))}
				</div>
			)}
		</main>
	)
}
