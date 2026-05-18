import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/dev-seed', '/checkout', '/order/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
