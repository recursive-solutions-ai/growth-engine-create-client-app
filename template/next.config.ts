import type { NextConfig } from 'next'
import { securityHeaders } from '@growth-engine/sdk-server/security-headers'
import type { SecurityHeadersOptions } from '@growth-engine/sdk-server/security-headers'

// The per-client customization point for security headers. Empty = the SDK
// defaults (CSP in report-only mode). Examples:
//   csp: { extend: { 'script-src': ['https://js.stripe.com'] } }  // extra script origin
//   frameAncestors: ['https://partner.example.com']               // allow framing by an origin
//   csp: { mode: 'enforce' }                                      // switch CSP to enforce
const securityHeaderOptions: SecurityHeadersOptions = {}

const nextConfig: NextConfig = {
	serverExternalPackages: [
		'@growth-engine/sdk-server',
		'@libsql/client',
		'libsql',
		'drizzle-orm',
	],
	async headers() {
		return [{ source: '/:path*', headers: securityHeaders(securityHeaderOptions) }]
	},
}

export default nextConfig
