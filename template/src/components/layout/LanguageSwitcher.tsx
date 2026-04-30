'use client'

import { usePathname, useRouter } from 'next/navigation'
import { supportedLocales as configLocales } from '@/i18n/config'

const LOCALE_NAMES: Record<string, string> = {
	en: 'English',
	fr: 'Fran\u00E7ais',
	es: 'Espa\u00F1ol',
	de: 'Deutsch',
	it: 'Italiano',
	pt: 'Portugu\u00EAs',
	nl: 'Nederlands',
	ja: '\u65E5\u672C\u8A9E',
	zh: '\u4E2D\u6587',
	ko: '\uD55C\uAD6D\uC5B4',
	ar: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
	ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
}

export function LanguageSwitcher({ locale }: { locale: string }) {
	const pathname = usePathname()
	const router = useRouter()

	if (configLocales.length <= 1) {
		return null
	}

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const newLocale = e.target.value

		// Check if the current path starts with a locale prefix
		const segments = pathname.split('/')
		const firstSegment = segments[1] ?? ''
		const hasLocalePrefix = configLocales.includes(firstSegment)

		let newPath: string

		if (hasLocalePrefix) {
			// Replace existing locale prefix
			segments[1] = newLocale
			newPath = segments.join('/')
		} else {
			// Add locale prefix
			newPath = `/${newLocale}${pathname}`
		}

		router.push(newPath)
	}

	return (
		<select
			className="select select-sm select-bordered"
			value={locale}
			onChange={handleChange}
			aria-label="Select language"
		>
			{configLocales.map((loc) => (
				<option key={loc} value={loc}>
					{LOCALE_NAMES[loc] ?? loc}
				</option>
			))}
		</select>
	)
}
