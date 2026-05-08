import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sitemap', () => {
	const originalEnv = process.env

	beforeEach(() => {
		vi.resetModules()
		process.env = { ...originalEnv }
		process.env.SITE_URL = 'https://example.com'
	})

	afterEach(() => {
		process.env = originalEnv
		vi.unstubAllGlobals()
	})

	async function loadSitemap(config?: {
		defaultLocale?: string
		supportedLocales?: string[]
		isMultiLang?: boolean
	}) {
		vi.doMock('@/i18n/config', () => ({
			defaultLocale: config?.defaultLocale ?? 'en',
			supportedLocales: config?.supportedLocales ?? ['en'],
			isMultiLang: config?.isMultiLang ?? false,
			additionalLocales: (config?.supportedLocales ?? ['en']).slice(1),
		}))
		const mod = await import('./sitemap')
		return {
			generateSitemaps: mod.generateSitemaps,
			sitemap: mod.default,
		}
	}

	// ─── generateSitemaps ────────────────────────────────────────────────

	describe('generateSitemaps', () => {
		it('returns static (id=0), one blog sitemap (id=1), and authors sitemap (id=2) for small counts', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ count: 5 }),
				}),
			)

			const { generateSitemaps } = await loadSitemap()
			const result = await generateSitemaps()

			expect(result).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }])
		})

		it('creates multiple blog sitemaps plus authors when count exceeds batch size', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ count: 2500 }),
				}),
			)

			const { generateSitemaps } = await loadSitemap()
			const result = await generateSitemaps()

			// 2500 / 1000 = 3 blog sitemaps + 1 static + 1 authors = 5
			expect(result).toHaveLength(5)
			expect(result).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
		})

		it('returns static + 1 blog + authors sitemap when fetch fails', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockRejectedValue(new Error('network error')),
			)

			const { generateSitemaps } = await loadSitemap()
			const result = await generateSitemaps()

			expect(result).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }])
		})

		it('returns static + 1 blog + authors sitemap when API returns non-ok response', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({ ok: false }),
			)

			const { generateSitemaps } = await loadSitemap()
			const result = await generateSitemaps()

			expect(result).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }])
		})
	})

	// ─── Static pages sitemap (id=0) ─────────────────────────────────────

	describe('sitemap id=0 (static pages)', () => {
		it('returns entries for all static pages', async () => {
			vi.stubGlobal('fetch', vi.fn())

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 0 })

			const urls = result.map((e) => e.url)
			expect(urls).toContain('https://example.com')
			expect(urls).toContain('https://example.com/blog')
			expect(urls).toContain('https://example.com/blog/authors')
			expect(urls).toContain('https://example.com/contact')
			expect(urls).toContain('https://example.com/privacy')
			expect(urls).toContain('https://example.com/legal')
			expect(urls).toContain('https://example.com/cookies')
		})

		it('gives homepage highest priority (1.0)', async () => {
			vi.stubGlobal('fetch', vi.fn())

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 0 })

			const home = result.find((e) => e.url === 'https://example.com')
			expect(home?.priority).toBe(1.0)
			expect(home?.changeFrequency).toBe('monthly')
		})

		it('gives non-home pages priority 0.7', async () => {
			vi.stubGlobal('fetch', vi.fn())

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 0 })

			const nonHome = result.filter((e) => e.url !== 'https://example.com')
			for (const entry of nonHome) {
				expect(entry.priority).toBe(0.7)
			}
		})

		it('does not include alternates in single-lang mode', async () => {
			vi.stubGlobal('fetch', vi.fn())

			const { sitemap } = await loadSitemap({ isMultiLang: false })
			const result = await sitemap({ id: 0 })

			for (const entry of result) {
				expect(entry.alternates).toBeUndefined()
			}
		})

		it('includes hreflang alternates in multi-lang mode', async () => {
			vi.stubGlobal('fetch', vi.fn())

			const { sitemap } = await loadSitemap({
				defaultLocale: 'en',
				supportedLocales: ['en', 'fr'],
				isMultiLang: true,
			})
			const result = await sitemap({ id: 0 })

			const home = result.find((e) => e.url === 'https://example.com')
			expect(home?.alternates?.languages?.en).toBe('https://example.com')
			expect(home?.alternates?.languages?.fr).toBe('https://example.com/fr')
		})
	})

	// ─── Blog posts sitemap (id=1+) ──────────────────────────────────────

	describe('sitemap id=1+ (blog posts)', () => {
		it('returns blog post entries', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'hello-world', language: 'en', updatedAt: '2025-01-01', parentPostId: null },
							{ slug: 'second-post', language: 'en', updatedAt: '2025-01-02', parentPostId: null },
						]),
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			expect(result).toHaveLength(2)
			const urls = result.map((e) => e.url)
			expect(urls).toContain('https://example.com/blog/hello-world')
			expect(urls).toContain('https://example.com/blog/second-post')
		})

		it('sets weekly change frequency and 0.8 priority', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'test-post', language: 'en', updatedAt: null, parentPostId: null },
						]),
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			expect(result[0]?.changeFrequency).toBe('weekly')
			expect(result[0]?.priority).toBe(0.8)
		})

		it('includes lastModified from updatedAt', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'dated', language: 'en', updatedAt: '2025-06-15T10:00:00Z', parentPostId: null },
						]),
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			expect(result[0]?.lastModified).toBeInstanceOf(Date)
		})

		it('omits lastModified when updatedAt is null', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'no-date', language: 'en', updatedAt: null, parentPostId: null },
						]),
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			expect(result[0]?.lastModified).toBeUndefined()
		})

		it('returns empty array when fetch fails', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockRejectedValue(new Error('network')),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			expect(result).toEqual([])
		})

		it('groups translations by parentPostId with hreflang alternates', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation((url: string) => {
					if (typeof url === 'string' && url.includes('locale=en')) {
						return Promise.resolve({
							ok: true,
							json: () =>
								Promise.resolve([
									{ slug: 'hello-en', language: 'en', updatedAt: null, parentPostId: 'parent-1' },
								]),
						})
					}
					if (typeof url === 'string' && url.includes('locale=fr')) {
						return Promise.resolve({
							ok: true,
							json: () =>
								Promise.resolve([
									{ slug: 'hello-fr', language: 'fr', updatedAt: null, parentPostId: 'parent-1' },
								]),
						})
					}
					return Promise.resolve({ ok: false })
				}),
			)

			const { sitemap } = await loadSitemap({
				defaultLocale: 'en',
				supportedLocales: ['en', 'fr'],
				isMultiLang: true,
			})
			const result = await sitemap({ id: 1 })

			expect(result.length).toBeGreaterThanOrEqual(1)

			for (const entry of result) {
				expect(entry.alternates?.languages?.en).toContain('/blog/hello-en')
				expect(entry.alternates?.languages?.fr).toContain('/blog/hello-fr')
			}
		})

		it('does not add alternates for standalone posts in single-lang mode', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'solo-post', language: 'en', updatedAt: null, parentPostId: null },
						]),
				}),
			)

			const { sitemap } = await loadSitemap({ isMultiLang: false })
			const result = await sitemap({ id: 1 })

			expect(result[0]?.alternates).toBeUndefined()
		})

		it('deduplicates posts by slug', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () =>
						Promise.resolve([
							{ slug: 'same-slug', language: 'en', updatedAt: null, parentPostId: 'p1' },
							{ slug: 'same-slug', language: 'en', updatedAt: null, parentPostId: 'p1' },
						]),
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 1 })

			const urls = result.filter((e) => e.url.includes('same-slug'))
			expect(urls).toHaveLength(1)
		})
	})

	// ─── Authors sitemap (last id) ───────────────────────────────────────

	describe('sitemap authors shard (last id)', () => {
		it('returns one entry per author', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation((url: string) => {
					if (typeof url === 'string' && url.includes('type=blog-authors')) {
						return Promise.resolve({
							ok: true,
							json: () =>
								Promise.resolve([
									{ slug: 'jane-doe', updatedAt: '2026-01-01' },
									{ slug: 'john-smith', updatedAt: null },
								]),
						})
					}
					if (typeof url === 'string' && url.includes('count=true')) {
						return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
					}
					return Promise.resolve({ ok: false })
				}),
			)

			const { sitemap } = await loadSitemap()
			// blog count is 0 → blogSitemapCount = 1 → authors id = 2
			const result = await sitemap({ id: 2 })

			expect(result).toHaveLength(2)
			const urls = result.map((e) => e.url)
			expect(urls).toContain('https://example.com/blog/authors/jane-doe')
			expect(urls).toContain('https://example.com/blog/authors/john-smith')
		})

		it('uses 0.6 priority and monthly changeFrequency', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation((url: string) => {
					if (typeof url === 'string' && url.includes('type=blog-authors')) {
						return Promise.resolve({
							ok: true,
							json: () => Promise.resolve([{ slug: 'a', updatedAt: null }]),
						})
					}
					if (typeof url === 'string' && url.includes('count=true')) {
						return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
					}
					return Promise.resolve({ ok: false })
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 2 })

			expect(result[0]?.priority).toBe(0.6)
			expect(result[0]?.changeFrequency).toBe('monthly')
		})

		it('includes hreflang alternates in multi-lang mode', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation((url: string) => {
					if (typeof url === 'string' && url.includes('type=blog-authors')) {
						return Promise.resolve({
							ok: true,
							json: () => Promise.resolve([{ slug: 'jane', updatedAt: null }]),
						})
					}
					if (typeof url === 'string' && url.includes('count=true')) {
						return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
					}
					return Promise.resolve({ ok: false })
				}),
			)

			const { sitemap } = await loadSitemap({
				defaultLocale: 'en',
				supportedLocales: ['en', 'fr'],
				isMultiLang: true,
			})
			const result = await sitemap({ id: 2 })

			expect(result[0]?.alternates?.languages?.en).toBe(
				'https://example.com/blog/authors/jane',
			)
			expect(result[0]?.alternates?.languages?.fr).toBe(
				'https://example.com/fr/blog/authors/jane',
			)
		})

		it('returns empty array when authors fetch fails', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation((url: string) => {
					if (typeof url === 'string' && url.includes('type=blog-authors')) {
						return Promise.reject(new Error('network'))
					}
					if (typeof url === 'string' && url.includes('count=true')) {
						return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
					}
					return Promise.resolve({ ok: false })
				}),
			)

			const { sitemap } = await loadSitemap()
			const result = await sitemap({ id: 2 })

			expect(result).toEqual([])
		})
	})
})
