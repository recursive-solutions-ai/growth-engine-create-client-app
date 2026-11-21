/**
 * Posts per page on the blog listing. Single source of truth for BOTH the
 * server-side page math (`/blog/page/N` out-of-range 404s) and the client-side
 * `BlogList` slicing — the pages pass this as the `postsPerPage` prop, so the
 * two can never drift.
 *
 * ⚠️ Do NOT import `BLOG_POSTS_PER_PAGE` from `@growth-engine/sdk-client/components`
 * in a server component instead: that bundle is marked `"use client"`, so value
 * imports in server components silently become client-reference proxies and any
 * arithmetic with them is NaN (the out-of-range check then never fires).
 */
export const BLOG_POSTS_PER_PAGE = 9
