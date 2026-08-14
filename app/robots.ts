import { MetadataRoute } from 'next';

import { resolveApplicationUrl } from '@/lib/config/application-url';

const applicationUrl = resolveApplicationUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/features',
        '/industries',
        '/architecture',
        '/demo',
        '/demo/story',
        '/docs',
        '/status',
        '/privacy',
        '/terms',
      ],
      disallow: ['/dashboard', '/dashboard/', '/dashboard/*', '/api/', '/login', '/register'],
    },
    sitemap: new URL('/sitemap.xml', applicationUrl).toString(),
  };
}
