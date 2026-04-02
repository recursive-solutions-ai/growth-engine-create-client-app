const en = {
	// Navigation
	'nav.home': 'Home',
	'nav.blog': 'Blog',
	'nav.contact': 'Contact',

	// Hero
	'hero.title': 'Welcome to {{CLIENT_NAME}}',
	'hero.subtitle': 'AI-powered content, social media, and analytics — all managed for you.',
	'hero.cta.blog': 'Read Our Blog',
	'hero.cta.contact': 'Get in Touch',

	// Features
	'features.heading': 'Everything You Need to Grow',
	'features.ai.title': 'AI Blog Content',
	'features.ai.description': 'Automatically generated, SEO-optimized blog posts tailored to your business.',
	'features.social.title': 'Social Media Sync',
	'features.social.description': 'Keep your social profiles up to date across Instagram, LinkedIn, and Facebook.',
	'features.analytics.title': 'Analytics & Insights',
	'features.analytics.description': 'Track visitor engagement and content performance in real time.',

	// CTA
	'cta.heading': 'Ready to Get Started?',
	'cta.subtitle': 'Contact us today to learn how our AI-powered growth engine can transform your online presence.',
	'cta.button': 'Contact Us',

	// Blog
	'blog.heading': 'Blog',
	'blog.subtitle': 'Latest articles and insights',
	'blog.search.placeholder': 'Search posts...',
	'blog.no.posts': 'No posts found',
	'blog.clear.search': 'Clear search',
	'blog.back': 'Back to Blog',
	'blog.post.not.found': 'Post Not Found',
	'blog.post.not.found.description': "The post you're looking for doesn't exist.",
	'blog.related.posts': 'Related Posts',
	'blog.load.error': 'Failed to load posts: {error}',

	// Home
	'home.latest.blog': 'Latest from the Blog',
	'home.view.all': 'View all',
	'home.no.posts': 'No posts yet. Check back soon!',

	// Footer
	'footer.navigation': 'Navigation',
	'footer.legal': 'Legal',
	'footer.privacy.policy': 'Privacy Policy',
	'footer.cookie.policy': 'Cookie Policy',
	'footer.legal.notice': 'Legal Notice',
	'footer.copyright': '\u00A9 {year} {{CLIENT_NAME}}. All rights reserved.',
	'footer.powered.by': 'Powered by Recursive Solutions',

	// Contact
	'contact.heading': 'Contact Us',
	'contact.subtitle': "We'd love to hear from you",
	'contact.load.error': 'Failed to load contact information',
	'contact.business.hours': 'Business Hours',
	'contact.info': 'Contact Information',

	// Page titles
	'page.privacy.policy': 'Privacy Policy',
	'page.terms.of.service': 'Terms of Service',
	'page.cookie.policy': 'Cookie Policy',

	// Language names
	'lang.en': 'English',
	'lang.fr': 'Fran\u00E7ais',
	'lang.es': 'Espa\u00F1ol',
	'lang.de': 'Deutsch',
	'lang.it': 'Italiano',
	'lang.pt': 'Portugu\u00EAs',
	'lang.nl': 'Nederlands',
	'lang.ja': '\u65E5\u672C\u8A9E',
	'lang.zh': '\u4E2D\u6587',
	'lang.ko': '\uD55C\uAD6D\uC5B4',
	'lang.ar': '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
	'lang.ru': '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
} as const

export default en

export type DictionaryKey = keyof typeof en
export type Dictionary = Record<DictionaryKey, string>
