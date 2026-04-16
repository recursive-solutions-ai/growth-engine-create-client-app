export const defaultLocale: string = process.env.DEFAULT_LANGUAGE ?? 'en'

export const additionalLocales: string[] =
	process.env.ADDITIONAL_LANGUAGES
		? process.env.ADDITIONAL_LANGUAGES.split(',').map((l) => l.trim()).filter(Boolean)
		: []

export const supportedLocales: string[] = [defaultLocale, ...additionalLocales]

export const isMultiLang: boolean = additionalLocales.length > 0
