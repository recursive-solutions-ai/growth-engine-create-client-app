import Link from 'next/link'
import type { Dictionary } from '@/i18n'
import { localizedPath } from '@/lib/i18n-utils'
import { SiteImage } from '@/components/ui/SiteImage'
import heroImage from '../../../public/images/hero.jpg'
import { ScrollReveal } from './ScrollReveal'

export function Hero({ dict, locale }: { dict: Dictionary; locale: string }) {
	return (
		<section className="hero min-h-[60vh] bg-base-200">
			<div className="hero-content flex-col gap-10 lg:flex-row-reverse lg:gap-16">
				{/* Not wrapped in ScrollReveal: this is the LCP element, it must paint immediately. */}
				<SiteImage
					src={heroImage}
					alt={dict['hero.image.alt']}
					sizes="(min-width: 1024px) 560px, 100vw"
					placeholder="blur"
					preload
					className="w-full max-w-xl rounded-box shadow-2xl lg:max-w-lg"
				/>
				<div className="max-w-2xl text-center lg:text-left">
					<ScrollReveal y={30} duration={0.7} start="top 95%">
						<h1 className="text-5xl font-bold">
							{dict['hero.title']}
						</h1>
					</ScrollReveal>
					<ScrollReveal y={20} delay={0.15} start="top 95%">
						<p className="py-6 text-lg text-base-content/70">
							{dict['hero.subtitle']}
						</p>
					</ScrollReveal>
					<ScrollReveal y={20} delay={0.3} start="top 95%">
						<div className="flex flex-wrap gap-4 justify-center lg:justify-start">
							<Link href={localizedPath('/blog', locale)} className="btn btn-primary">
								{dict['hero.cta.blog']}
							</Link>
							<Link href={localizedPath('/contact', locale)} className="btn btn-outline">
								{dict['hero.cta.contact']}
							</Link>
						</div>
					</ScrollReveal>
				</div>
			</div>
		</section>
	)
}
