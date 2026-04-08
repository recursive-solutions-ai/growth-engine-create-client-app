'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Dictionary, DictionaryKey } from './dictionaries/en'

interface I18nContextValue {
	locale: string
	dict: Dictionary
	supportedLocales: string[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function DictionaryProvider({
	dict,
	locale,
	supportedLocales,
	children,
}: {
	dict: Dictionary
	locale: string
	supportedLocales: string[]
	children: ReactNode
}) {
	return (
		<I18nContext.Provider value={{ locale, dict, supportedLocales }}>
			{children}
		</I18nContext.Provider>
	)
}

export function useI18n() {
	const ctx = useContext(I18nContext)

	if (!ctx) {
		throw new Error('useI18n must be used within a DictionaryProvider')
	}

	const { locale, dict, supportedLocales } = ctx

	function t(key: DictionaryKey, vars?: Record<string, string>): string {
		let value: string = dict[key]

		if (vars) {
			for (const [k, v] of Object.entries(vars)) {
				value = value.replaceAll(`{${k}}`, v)
			}
		}

		return value
	}

	return { locale, t, supportedLocales }
}
