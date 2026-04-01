import type { Metadata } from 'next'
import { GrowthEngineProvider } from '@growth-engine/sdk-client'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import './globals.css'

export const metadata: Metadata = {
	title: '{{CLIENT_NAME}}',
	description: '{{CLIENT_NAME}} — Powered by Recursive Solutions',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" data-theme="light">
			<body className="min-h-screen flex flex-col">
				<GoogleAnalytics />
				<GrowthEngineProvider>
					{children}
				</GrowthEngineProvider>
			</body>
		</html>
	)
}
