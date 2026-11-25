// Remote hosts whose images Next's optimizer may fetch and resize.
// next.config.ts imports this file, so it must not import anything.
//
// Growth Engine media (blog heroes, author avatars) lives in Google Cloud
// Storage. To optimize images from another host, add its hostname here.
// Never add a wildcard: the optimizer would then proxy any URL on the web.
export const OPTIMIZABLE_IMAGE_HOSTS: readonly string[] = ['storage.googleapis.com']

/**
 * True when Next's image optimizer can handle `src`: a local path (single
 * leading `/`) or an https URL on an allowlisted host. Everything else
 * (other hosts, http:, protocol-relative, data:, unparsable) is false.
 */
export function isOptimizableSrc(src: string): boolean {
	if (src.startsWith('//')) return false
	if (src.startsWith('/')) return true
	try {
		const url = new URL(src)
		return url.protocol === 'https:' && OPTIMIZABLE_IMAGE_HOSTS.includes(url.hostname)
	} catch {
		return false
	}
}
