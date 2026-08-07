import { MetadataRoute } from 'next';

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
    sitemap: 'https://voxdesk-ai.vercel.app/sitemap.xml',
  };
}
