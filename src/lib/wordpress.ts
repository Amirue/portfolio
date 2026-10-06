/**
 * WordPress REST API adapter for the portfolio gallery.
 * Fetches gallery posts from the local WordPress install and maps
 * them to the data shape expected by gallery.js (window.galleryData).
 */

const WP_API = import.meta.env.PUBLIC_WP_API_URL || 'http://localhost/portfolio-wp/wp-json/wp/v2';

export interface WPGalleryImage {
  id: number;
  url: string;
}

export interface WPAcfFields {
  location: string;
  camera: string;
  date_label: string;
  views: number;
  likes: number;
  gallery_images: WPGalleryImage[];
  tags: string;
}

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf: WPAcfFields;
  gallery_type: string[];
}

export interface GalleryPost {
  id: string;
  type: string;
  date: string;
  location: string;
  title: string;
  caption: string;
  tags: string[];
  media: string[];
  likes: number;
  camera: string;
  views: string;
  wide: boolean;
}

export interface GalleryData {
  profile: Record<string, unknown>;
  highlights: { id: string; label: string; tone: string }[];
  posts: GalleryPost[];
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function mapPost(wp: WPPost): GalleryPost {
  const acf = wp.acf || {} as WPAcfFields;
  const type = (wp.gallery_type && wp.gallery_type[0]) || 'moments';
  const tags = (acf.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : '#' + t));

  const media = (acf.gallery_images || []).map((img) => img.url).filter(Boolean);

  return {
    id: wp.slug,
    type,
    date: acf.date_label || '',
    location: acf.location || '',
    title: stripHtml(wp.title.rendered),
    caption: stripHtml(wp.content.rendered) || stripHtml(wp.excerpt.rendered),
    tags,
    media,
    likes: acf.likes || 0,
    camera: acf.camera || '',
    views: formatViews(acf.views || 0),
    wide: media.length > 1,
  };
}

const HIGHLIGHTS = [
  { id: 'all', label: 'All', tone: 'coral' },
  { id: 'events', label: 'Events', tone: 'amber' },
  { id: 'travel', label: 'Travel', tone: 'sage' },
  { id: 'studio', label: 'Studio', tone: 'lavender' },
  { id: 'moments', label: 'Moments', tone: 'cyan' },
];

export async function fetchGalleryData(): Promise<GalleryData> {
  try {
    const res = await fetch(`${WP_API}/gallery_post?per_page=50&acf_format=standard`, {
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) {
      console.error('WP API returned non-JSON response (HTML?). Using empty data.');
      return { profile: {}, highlights: HIGHLIGHTS, posts: [] };
    }
    const wpPosts: WPPost[] = JSON.parse(text);
    return {
      profile: {},
      highlights: HIGHLIGHTS,
      posts: wpPosts.map(mapPost),
    };
  } catch (e) {
    console.error('WP API fetch failed:', e);
    return { profile: {}, highlights: HIGHLIGHTS, posts: [] };
  }
}
