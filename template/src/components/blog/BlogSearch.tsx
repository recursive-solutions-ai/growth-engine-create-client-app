'use client'

import { useI18n } from '@/i18n/client'

export function BlogSearch({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) {
	const { t } = useI18n()

	return (
		<div className="mb-8">
			<div className="relative max-w-md mx-auto">
				<input
					type="text"
					placeholder={t('blog.search.placeholder')}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="input input-bordered w-full pl-10"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
					/>
				</svg>
			</div>
		</div>
	)
}
