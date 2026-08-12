import { MetadataRoute } from 'next';

import { resolveApplicationUrl } from '@/lib/config/application-url';

const applicationUrl = resolveApplicationUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/demo', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/docs', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/privacy', changeFrequency: 'monthly' as const, priority: 0.4 },
    { path: '/terms', changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  return entries.map(entry => ({
    url: new URL(entry.path, applicationUrl).toString(),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
