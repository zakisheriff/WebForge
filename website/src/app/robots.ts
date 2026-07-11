import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          '*',
          'GPTBot',
          'ChatGPT-User',
          'Claude-Web',
          'ClaudeBot',
          'Google-Extended',
          'Googlebot',
          'PerplexityBot',
          'facebookexternalhit',
          'Diffbot',
          'Applebot',
          'Applebot-Extended',
          'Bingbot',
          'cohere-ai'
        ],
        allow: '/',
      }
    ],
    sitemap: 'https://webforge.theatom.lk/sitemap.xml',
  };
}
