import { describe, it, expect } from 'vitest'
import { OPTIMIZABLE_IMAGE_HOSTS, isOptimizableSrc } from './image-hosts'

describe('isOptimizableSrc', () => {
	it('accepts local paths', () => {
		expect(isOptimizableSrc('/images/hero.jpg')).toBe(true)
		expect(isOptimizableSrc('/')).toBe(true)
	})

	it('accepts https on allowlisted hosts', () => {
		expect(isOptimizableSrc('https://storage.googleapis.com/bucket/a.png')).toBe(true)
	})

	it('rejects everything else', () => {
		expect(isOptimizableSrc('https://example.com/a.png')).toBe(false)
		expect(isOptimizableSrc('http://storage.googleapis.com/a.png')).toBe(false)
		expect(isOptimizableSrc('//storage.googleapis.com/a.png')).toBe(false)
		expect(isOptimizableSrc('https://storage.googleapis.com.evil.com/a.png')).toBe(false)
		expect(isOptimizableSrc('data:image/png;base64,AAAA')).toBe(false)
		expect(isOptimizableSrc('not a url')).toBe(false)
		expect(isOptimizableSrc('')).toBe(false)
	})

	it('never allowlists a wildcard host', () => {
		expect(OPTIMIZABLE_IMAGE_HOSTS.some((h) => h.includes('*'))).toBe(false)
	})
})
