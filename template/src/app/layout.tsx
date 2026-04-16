import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { GrowthEngineProvider } from '@growth-engine/sdk-client'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import './globals.css'

export const metadata: Metadata = {
	title: '{{CLIENT_NAME}}',
	description: '{{CLIENT_NAME}} — Powered by Recursive Solutions',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const headersList = await headers()
	const locale = headersList.get('x-locale') || 'en'

	return (
		<html lang={locale} data-theme="light">
			<body className="min-h-screen flex flex-col">
				<GoogleAnalytics />
				<GrowthEngineProvider>
					{children}
				</GrowthEngineProvider>
			</body>
		</html>
	)
}
