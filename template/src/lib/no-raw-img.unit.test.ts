import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Every image goes through `SiteImage` (next/image wrapper) so it is resized,
 * converted and lazy-loaded. A raw `<img>` or a direct `next/image` import
 * silently skips that (or crashes on unlisted hosts). See CLAUDE.md "Images".
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '..')
const SCAN_DIRS = [join(SRC, 'app'), join(SRC, 'components')]
const ALLOWED_NEXT_IMAGE = join(SRC, 'components', 'ui', 'SiteImage.tsx')

function walk(dir: string): string[] {
	const out: string[] = []
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) {
			out.push(...walk(full))
		} else if (/\.tsx$/.test(entry) && !entry.includes('.test.')) {
			out.push(full)
		}
	}
	return out
}

function stripComments(code: string): string {
	return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('no raw <img> or direct next/image', () => {
	it('uses SiteImage everywhere', () => {
		const offenders: string[] = []
		for (const dir of SCAN_DIRS) {
			for (const file of walk(dir)) {
				const code = stripComments(readFileSync(file, 'utf8'))
				const rel = file.slice(SRC.length + 1)
				if (/<img[\s/>]/.test(code)) offenders.push(`${rel} (raw <img>)`)
				if (file !== ALLOWED_NEXT_IMAGE && /from\s+['"]next\/image['"]/.test(code)) {
					offenders.push(`${rel} (imports next/image)`)
				}
			}
		}
		expect(
			offenders,
			`Use SiteImage from @/components/ui/SiteImage instead: ${offenders.join(', ')}`,
		).toEqual([])
	})
})
