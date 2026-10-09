import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// robots.ts renders the tenant's AI-crawler policy through sdk-server's
// getAiCrawlerRules — mocked here so the unit test needs no Brain, no network.
const mocks = vi.hoisted(() => ({
	getAiCrawlerRules: vi.fn(),
}))

vi.mock('@growth-engine/sdk-server', () => ({
	getAiCrawlerRules: mocks.getAiCrawlerRules,
}))

describe('robots', () => {
	const originalEnv = process.env

	beforeEach(() => {
		vi.resetModules()
		mocks.getAiCrawlerRules.mockReset().mockResolvedValue([])
		process.env = { ...originalEnv }
	})

	afterEach(() => {
		process.env = originalEnv
	})

	async function loadRobots() {
		const mod = await import('./robots')
		return mod.default
	}

	function firstRule(result: { rules: unknown }) {
		return Array.isArray(result.rules) ? result.rules[0] : result.rules
	}

	it('returns rules allowing all crawlers on /', async () => {
		const robots = await loadRobots()
		const result = await robots()
		const rules = firstRule(result)
		expect(rules?.userAgent).toBe('*')
		expect(rules?.allow).toBe('/')
	})

	it('disallows /api/ path', async () => {
		const robots = await loadRobots()
		const result = await robots()
		const rules = firstRule(result)
		expect(rules?.disallow).toContain('/api/')
	})

	it('appends per-bot AI-crawler rules after the default rule', async () => {
		mocks.getAiCrawlerRules.mockResolvedValue([
			{ userAgent: 'GPTBot', allow: '/' },
			{ userAgent: 'ClaudeBot', allow: '/' },
		])
		const robots = await loadRobots()
		const result = await robots()
		expect(result.rules).toEqual([
			{ userAgent: '*', allow: '/', disallow: ['/api/'] },
			{ userAgent: 'GPTBot', allow: '/' },
			{ userAgent: 'ClaudeBot', allow: '/' },
		])
	})

	it('keeps the default rules untouched when no policy is set', async () => {
		mocks.getAiCrawlerRules.mockResolvedValue([])
		const robots = await loadRobots()
		const result = await robots()
		expect(result.rules).toEqual([{ userAgent: '*', allow: '/', disallow: ['/api/'] }])
	})

	it('passes the Brain env vars through to the SDK', async () => {
		process.env.BRAIN_API_URL = 'https://brain.example.com'
		process.env.BRAIN_API_KEY = 'brain_test_key'
		const robots = await loadRobots()
		await robots()
		expect(mocks.getAiCrawlerRules).toHaveBeenCalledWith({
			brainApiUrl: 'https://brain.example.com',
			brainApiKey: 'brain_test_key',
		})
	})

	it('includes sitemap URL pointing to /sitemap.xml', async () => {
		process.env.SITE_URL = 'https://example.com'
		delete process.env.VERCEL_PROJECT_PRODUCTION_URL
		const robots = await loadRobots()
		const result = await robots()
		expect(result.sitemap).toBe('https://example.com/sitemap.xml')
	})

	it('uses VERCEL_PROJECT_PRODUCTION_URL when SITE_URL is absent', async () => {
		delete process.env.SITE_URL
		process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-app.vercel.app'
		const robots = await loadRobots()
		const result = await robots()
		expect(result.sitemap).toBe('https://my-app.vercel.app/sitemap.xml')
	})

	it('defaults to http://localhost:3000 when no URL env vars set', async () => {
		delete process.env.SITE_URL
		delete process.env.VERCEL_PROJECT_PRODUCTION_URL
		const robots = await loadRobots()
		const result = await robots()
		expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml')
	})

	it('prefers SITE_URL over VERCEL_PROJECT_PRODUCTION_URL', async () => {
		process.env.SITE_URL = 'https://custom-domain.com'
		process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-app.vercel.app'
		const robots = await loadRobots()
		const result = await robots()
		expect(result.sitemap).toBe('https://custom-domain.com/sitemap.xml')
	})
})
