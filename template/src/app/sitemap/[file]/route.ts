import {
	buildAuthorEntries,
	buildBlogEntries,
	buildLandingEntries,
	buildStaticEntries,
	buildTopicEntries,
	fetchBlogCount,
	getBlogSitemapCount,
	renderSitemapXml,
} from '@/lib/sitemap-shared'

export const revalidate = 3600

const FILE_PATTERN = /^(\d+)\.xml$/

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ file: string }> },
) {
	const { file } = await params
	const match = FILE_PATTERN.exec(file)
	if (!match) {
		return new Response('Not Found', { status: 404 })
	}

	const id = Number(match[1])
	if (!Number.isFinite(id) || id < 0) {
		return new Response('Not Found', { status: 404 })
	}

	const total = await fetchBlogCount()
	const blogSitemapCount = getBlogSitemapCount(total)
	const authorsId = blogSitemapCount + 1
	const landingId = blogSitemapCount + 2
	const topicsId = blogSitemapCount + 3

	if (id > topicsId) {
		return new Response('Not Found', { status: 404 })
	}

	let entries
	if (id === 0) {
		entries = buildStaticEntries()
	} else if (id === topicsId) {
		entries = await buildTopicEntries()
	} else if (id === landingId) {
		entries = await buildLandingEntries()
	} else if (id === authorsId) {
		entries = await buildAuthorEntries()
	} else {
		entries = await buildBlogEntries(id - 1)
	}

	const xml = renderSitemapXml(entries)
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
		},
	})
}
