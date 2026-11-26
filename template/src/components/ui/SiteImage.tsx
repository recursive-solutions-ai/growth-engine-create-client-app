'use client'

import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { isOptimizableSrc } from '@/lib/image-hosts'

/**
 * The only way to render an image on this site (a test enforces it).
 *
 * Wraps next/image. An owner-pasted image from a host that is not listed in
 * `src/lib/image-hosts.ts` would make next/image throw and crash the page, so
 * those render unoptimized instead (and warn in development).
 *
 * It is a client component because server pages pass it as a prop to the SDK
 * client components (`imageComponent={SiteImage}`).
 */
export function SiteImage({ unoptimized, ...props }: ImageProps) {
	const src = props.src
	let skipOptimizer = unoptimized
	if (skipOptimizer === undefined && typeof src === 'string' && !isOptimizableSrc(src)) {
		skipOptimizer = true
		if (process.env.NODE_ENV === 'development') {
			let host = src
			try {
				host = new URL(src).hostname
			} catch {
				// keep the raw src in the warning
			}
			console.warn(
				`[SiteImage] "${host}" is not in src/lib/image-hosts.ts, so this image is not optimized. Add the host there to optimize it.`,
			)
		}
	}
	return <Image {...props} {...(skipOptimizer !== undefined ? { unoptimized: skipOptimizer } : {})} />
}
