import { MetadataRoute } from 'next';

const applicationUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
