import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/portal', '/platform', '/staff', '/admin'] }],
    sitemap: 'https://www.abidebylaw.com/sitemap.xml',
  };
}
