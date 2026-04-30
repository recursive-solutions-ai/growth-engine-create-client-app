export function formatDate(date: Date | string, locale: string = 'en'): string {
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
