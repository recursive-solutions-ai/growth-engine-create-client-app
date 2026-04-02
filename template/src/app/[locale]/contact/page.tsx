'use client'

import { useState, useEffect } from 'react'
import { useBusinessConfig, useForm, submitForm } from '@growth-engine/sdk-client'
import { useI18n } from '@/i18n/client'
import { ConfigDisplay } from '@/components/config/ConfigDisplay'
import { trackEvent } from '@/components/analytics/GoogleAnalytics'

const CONTACT_FORM_SLUG = 'contact-form'

export default function ContactPage() {
	const { t } = useI18n()
	const { config, loading: configLoading } = useBusinessConfig()
	const { form, loading: formLoading } = useForm(CONTACT_FORM_SLUG)

	const [formData, setFormData] = useState<Record<string, unknown>>({})
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [error, setError] = useState('')
	const [initialized, setInitialized] = useState(false)

	useEffect(() => {
		trackEvent('contact_view')
	}, [])

	useEffect(() => {
		if (!form || initialized) return
		const initial: Record<string, unknown> = {}
		for (const field of form.fields) {
			initial[field.name] = field.type === 'checkbox' ? false : ''
		}
		setFormData(initial)
		setInitialized(true)
	}, [form, initialized])

	function updateField(name: string, value: unknown) {
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setSubmitting(true)

		try {
			const result = await submitForm(CONTACT_FORM_SLUG, formData)
			if (!result.ok) {
				if (result.validationErrors) {
					setError(result.validationErrors.map((err) => err.message).join(', '))
				} else {
					setError(result.error ?? 'Something went wrong')
				}
				return
			}
			setSubmitted(true)
			trackEvent('contact_form_submit')
		} catch {
			setError('Failed to submit. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	const loading = configLoading || formLoading

	const settings = form?.settings
		? typeof form.settings === 'string'
			? (JSON.parse(form.settings) as { successMessage?: string; submitButtonText?: string })
			: form.settings
		: null

	const sortedFields = form ? [...form.fields].sort((a, b) => a.order - b.order) : []

	return (
		<main className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold text-center mb-2">{t('contact.heading')}</h1>
			<p className="text-center text-base-content/60 mb-10">
				{t('contact.subtitle')}
			</p>

			{loading && (
				<div className="flex justify-center py-16">
					<span className="loading loading-spinner loading-lg" />
				</div>
			)}

			{!loading && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
					{/* Contact Form */}
					<div>
						{submitted ? (
							<div className="rounded-xl border bg-base-100 p-8 text-center shadow-lg">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
									<svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<h2 className="text-xl font-semibold">
									{settings?.successMessage ?? 'Thank you for your submission!'}
								</h2>
							</div>
						) : form ? (
							<form onSubmit={handleSubmit} className="space-y-4">
								{sortedFields.map((field) => (
									<div key={field.name} className="form-control w-full">
										<label htmlFor={field.name} className="label">
											<span className="label-text">
												{field.label}
												{field.required && <span className="ml-1 text-error">*</span>}
											</span>
										</label>

										{field.type === 'textarea' ? (
											<textarea
												id={field.name}
												required={field.required}
												placeholder={field.placeholder}
												rows={4}
												value={String(formData[field.name] ?? '')}
												onChange={(e) => updateField(field.name, e.target.value)}
												className="textarea textarea-bordered w-full"
											/>
										) : field.type === 'select' ? (
											<select
												id={field.name}
												required={field.required}
												value={String(formData[field.name] ?? '')}
												onChange={(e) => updateField(field.name, e.target.value)}
												className="select select-bordered w-full"
											>
												<option value="">{field.placeholder ?? 'Select...'}</option>
												{(field.options ?? []).map((opt) => (
													<option key={opt} value={opt}>{opt}</option>
												))}
											</select>
										) : field.type === 'checkbox' ? (
											<label className="label cursor-pointer justify-start gap-3">
												<input
													type="checkbox"
													id={field.name}
													required={field.required}
													checked={Boolean(formData[field.name])}
													onChange={(e) => updateField(field.name, e.target.checked)}
													className="checkbox"
												/>
												<span className="label-text">{field.placeholder}</span>
											</label>
										) : (
											<input
												type={field.type}
												id={field.name}
												required={field.required}
												placeholder={field.placeholder}
												value={String(formData[field.name] ?? '')}
												onChange={(e) => updateField(field.name, e.target.value)}
												className="input input-bordered w-full"
											/>
										)}
									</div>
								))}

								{error && (
									<div className="alert alert-error">
										<span>{error}</span>
									</div>
								)}

								<button
									type="submit"
									disabled={submitting}
									className="btn btn-primary w-full"
								>
									{submitting
										? 'Submitting...'
										: settings?.submitButtonText ?? 'Send Message'}
								</button>
							</form>
						) : null}
					</div>

					{/* Business Info */}
					{config && (
						<div>
							<ConfigDisplay
								hours={config.hours ?? null}
								contact={config.contact ?? null}
							/>
						</div>
					)}
				</div>
			)}
		</main>
	)
}
