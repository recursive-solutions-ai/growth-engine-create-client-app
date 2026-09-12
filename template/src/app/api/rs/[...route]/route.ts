import { GrowthEngineHandler } from '@growth-engine/sdk-server'

export const { GET, POST } = GrowthEngineHandler({
	brainApiUrl: process.env.BRAIN_API_URL,
	brainApiKey: process.env.BRAIN_API_KEY,
	tursoUrl: process.env.TURSO_DATABASE_URL,
	tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
	// This repo's blog post page renders <RelatedArticles> and <TopicChips>, and
	// /blog/topic/[slug] exists — so the structural internal links are really on
	// the pages Google crawls, and Brain may count them as inbound links.
	//
	// If you strip either the related block, the topic chips or the topic route
	// out of this repo, set this to false. Leaving it true would tell Brain's
	// orphan check about links that are not on the page, and a blog where every
	// post is an orphan would report as healthy.
	structuralLinks: true,
})
