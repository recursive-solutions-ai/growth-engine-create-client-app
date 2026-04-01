'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useForm, submitForm } from '@growth-engine/sdk-client'

export default function DynamicFormPage() {
  const { slug } = useParams<{ slug: string }>()
  const { form, loading, error: loadError } = useForm(slug)

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!form || initialized) return
    const initial: Record<string, unknown> = {}
    for (const field of form.fields) {
      if (field.type === 'checkbox') {
        initial[field.name] = false
      } else {
        initial[field.name] = ''
      }
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
      const result = await submitForm(slug, formData)
      if (!result.ok) {
        if (result.validationErrors) {
          setError(result.validationErrors.map((e) => e.message).join(', '))
        } else {
          setError(result.error ?? 'Something went wrong')
        }
        return
      }
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </main>
    )
  }

  if (loadError || !form) {
    return (
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Form not found</h1>
        <p className="mt-2 text-base-content/60">
          This form may have been removed or the link is incorrect.
        </p>
      </main>
    )
  }

  if (submitted) {
    const settings = typeof form.settings === 'string'
      ? JSON.parse(form.settings) as { successMessage?: string }
      : form.settings

    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg rounded-xl border bg-base-100 p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">
            {settings?.successMessage ?? 'Thank you for your submission!'}
          </h2>
        </div>
      </main>
    )
  }

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order)
  const settings = typeof form.settings === 'string'
    ? JSON.parse(form.settings) as { submitButtonText?: string }
    : form.settings

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold">{form.name}</h1>
        {form.description && (
          <p className="mt-2 text-base-content/60">{form.description}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              : settings?.submitButtonText ?? 'Submit'}
          </button>
        </form>
      </div>
    </main>
  )
}
