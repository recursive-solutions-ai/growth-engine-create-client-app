'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useI18n } from '@/i18n/client'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
	const { t, locale } = useI18n()
	const [menuOpen, setMenuOpen] = useState(false)

	const NAV_LINKS = [
		{ href: `/${locale}`, label: t('nav.home') },
		{ href: `/${locale}/blog`, label: t('nav.blog') },
		{ href: `/${locale}/contact`, label: t('nav.contact') },
	]

	return (
		<header className="navbar bg-base-100 shadow-sm border-b border-base-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 flex items-center justify-between">
				<Link href={`/${locale}`} className="text-xl font-bold text-primary">
					{'{{CLIENT_NAME}}'}
				</Link>

				{/* Desktop nav */}
				<nav className="hidden md:flex items-center gap-6">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-base-content/70 hover:text-primary transition-colors"
						>
							{link.label}
						</Link>
					))}
					<LanguageSwitcher />
					<ThemeToggle />
				</nav>

				{/* Mobile hamburger */}
				<button
					className="md:hidden btn btn-ghost btn-square"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="w-6 h-6 stroke-current"
					>
						{menuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="md:hidden border-t border-base-200 bg-base-100 absolute top-full left-0 right-0 shadow-lg">
					<nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-base-content/70 hover:text-primary transition-colors py-1"
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</Link>
						))}
						<LanguageSwitcher />
						<ThemeToggle />
					</nav>
				</div>
			)}
		</header>
	)
}
