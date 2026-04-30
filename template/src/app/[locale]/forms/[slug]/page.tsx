import { notFound } from 'next/navigation'
import { getFormBySlug } from '@growth-engine/sdk-server'
import { FormRenderer } from '@growth-engine/sdk-client/components'
import { getDb } from '@/lib/db'

export const revalidate = 60

export default async function DynamicFormPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { slug } = await params
	const db = getDb()
	const form = await getFormBySlug(db, slug)

	if (!form) notFound()

	return (
		<main className="container mx-auto px-4 py-12">
			<FormRenderer form={form} />
		</main>
	)
}
