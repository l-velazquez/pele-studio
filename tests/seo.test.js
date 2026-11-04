import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

const origin = 'https://pele-studio.cc'
const pages = [
  { path: '/', file: 'index.html', hasStaticContent: false },
  { path: '/about/', file: 'public/about/index.html', hasStaticContent: true },
  { path: '/guides/mermaid-to-png/', file: 'public/guides/mermaid-to-png/index.html', hasStaticContent: true },
]
const html = (file) => new JSDOM(readFileSync(resolve(file), 'utf8')).window.document

// The editor remains client-rendered. Its public introduction and guide are complete static HTML.
describe('public search metadata', () => {
  for (const page of pages) {
    it(`${page.path} has unique, initial-response metadata`, () => {
      const doc = html(page.file)
      expect(doc.title).toContain('Pele Studio')
      expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.length).toBeGreaterThan(50)
      expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(origin + page.path)
      expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(origin + page.path)
      expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(origin + '/social-preview.png')
      expect(doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image')
      expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '').not.toContain('noindex')
      if (page.hasStaticContent) {
        expect(doc.querySelectorAll('h1')).toHaveLength(1)
        expect(doc.body.textContent?.trim().length).toBeGreaterThan(500)
        expect(doc.querySelector('a[href="/"]')).not.toBeNull()
      }
    })
  }

  it('uses a different title and description for each page', () => {
    const docs = pages.map((page) => html(page.file))
    expect(new Set(docs.map((doc) => doc.title)).size).toBe(pages.length)
    expect(new Set(docs.map((doc) => doc.querySelector('meta[name="description"]')?.getAttribute('content'))).size).toBe(pages.length)
  })

  it('uses actual local files for static-page links and assets', () => {
    for (const page of pages.filter((page) => page.hasStaticContent)) {
      const doc = html(page.file)
      for (const el of doc.querySelectorAll('a[href], img[src], link[href]')) {
        const url = el.getAttribute('href') ?? el.getAttribute('src') ?? ''
        if (!url.startsWith('/') || url === '/') continue
        const pathname = new URL(url, origin).pathname
        const file = pathname.endsWith('/') ? `${pathname}index.html` : pathname
        expect(existsSync(resolve(`public${file}`)), `${page.path} links to missing ${url}`).toBe(true)
      }
    }
  })
})

describe('crawler discovery', () => {
  it('lists exactly the canonical public pages in its XML sitemap', () => {
    const sitemap = new JSDOM(readFileSync('public/sitemap.xml', 'utf8'), { contentType: 'application/xml' }).window.document
    const urls = Array.from(sitemap.querySelectorAll('loc'), (el) => el.textContent)
    expect(urls).toEqual(pages.map((page) => origin + page.path))
    expect(sitemap.querySelector('parsererror')).toBeNull()
  })

  it('allows crawlers and declares the sitemap', () => {
    const robots = readFileSync('public/robots.txt', 'utf8')
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).not.toMatch(/Disallow:\s*\//i)
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`)
    expect(existsSync('public/social-preview.png')).toBe(true)
  })
})
