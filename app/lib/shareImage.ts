/**
 * The picture a link to this site shows when it is shared on LinkedIn, X,
 * iMessage or Slack: a 1200×630 crop of the summit hero frame. A writing post
 * shows its own cover instead when it has one (see `postShareImage`).
 *
 * A constant rather than an `app/opengraph-image.jpg` file, because a page that
 * sets its own `openGraph` (every writing page does, for its title and URL)
 * replaces the parent's whole `openGraph` object, image included, so a
 * file-convention image would silently vanish from those pages. Spreading
 * `{ images: [SHARE_IMAGE] }` into each `openGraph` keeps it on all of them.
 * `twitter:image` follows from it, since no page sets `twitter.images`.
 *
 * The URL is root-relative; `metadataBase` in `app/layout.tsx` makes it
 * absolute against `SITE_URL`.
 */
export const SHARE_IMAGE = {
  url: '/images/share-summit.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Nadia Eldeib smiling on a snowy mountain summit, hands on hips, with clouded ridgelines behind her',
} as const;

export type ShareImage = {
  url: string;
  width?: number;
  height?: number;
  type?: string;
  alt: string;
};

/**
 * Substack's image CDN: `/image/fetch/<transforms>/<encoded source URL>`, where
 * the transforms may open with a `$s_!…!` signature that must be kept.
 */
const SUBSTACK_FETCH = /^https:\/\/substackcdn\.com\/image\/fetch\/(\$s_![^!,/]*!,)?[^/]*\/(https?%3A.+)$/;

/** The crop Substack's own share card uses, at the 1200×630 large-card size. */
const CARD_TRANSFORMS = 'w_1200,h_630,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto';

/**
 * The picture a link to one post shows: that post's cover, not the site photo.
 *
 * A Substack-hosted cover is re-requested from Substack's CDN at exactly the
 * large-card size (the same crop Substack serves for its own og:image), so the
 * dimensions can be stated. Any other https cover is used as-is with no size
 * claimed. Anything else (none, blank, plain http) falls back to SHARE_IMAGE.
 */
export function postShareImage(post: { title: string; coverImageUrl: string | null }): ShareImage {
  const cover = post.coverImageUrl?.trim() ?? '';
  if (!cover.startsWith('https://')) return SHARE_IMAGE;

  const alt = `Cover image for ${post.title}`;
  const match = SUBSTACK_FETCH.exec(cover);
  if (!match) return { url: cover, alt };

  const [, signature = '', source] = match;
  return {
    url: `https://substackcdn.com/image/fetch/${signature}${CARD_TRANSFORMS}/${source}`,
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt,
  };
}
