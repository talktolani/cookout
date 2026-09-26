import type { MetadataRoute } from 'next'

// Only the pages we want found. /tickets is the sales page and carries the
// Event markup. /tables and /thanks stay out while they have placeholders.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: 'https://thecookoutevent.com/tickets', lastModified: new Date(), changeFrequency: 'daily', priority: 1 }]
}
