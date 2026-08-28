import data from './site.json';

/**
 * The page's copy, lifted from the approved mockup rather than retyped.
 *
 * It lives as data (not inline JSX) so the CMS can edit it later without
 * touching components — and so a copy change is a content diff, not a code
 * diff. `site.json` is generated once from the mockup; from here it is the
 * source of truth and is edited directly.
 */

export type Frame = { src: string; alt: string; width: number; height: number };
export type Link = { href: string; label: string; host?: string };

export type Site = {
  hero: {
    eyebrow: string;
    headline: string[];
    lead: string;
    role: string;
    cueLabel: string;
    cueTitle: string;
    /**
     * `focus` and `focusMobile` are `object-position` values for the hero
     * backdrop, which `cover`-crops these 2:1 photos into a much taller box.
     *
     * They differ because the two viewports have opposite problems. On a wide
     * screen roughly a fifth of the width is cropped and the copy occupies the
     * left, so `focus` pulls a centrally-framed subject clear of the headline —
     * a lower percentage reveals more of the image's left side and carries the
     * subject rightward. On a phone the box is portrait and only about a fifth
     * of the photo survives, so `focusMobile` is simply the subject's own
     * position: without it the crop keeps the middle of the frame and loses
     * whoever was standing off-centre.
     *
     * Either may be omitted when the default centre crop already reads well.
     */
    frames: {
      src: string;
      width: number;
      height: number;
      focus?: string;
      focusMobile?: string;
    }[];
  };
  work: {
    number: string;
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    subhead: string;
    links: Link[];
    proof: string;
    frames: Frame[];
    advisory: {
      label: string;
      body: string;
      cta: string;
    };
  };
  about: {
    number: string;
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    facts: { label: string; value: string }[];
    cities: string[];
    frames: Frame[];
  };
  writing: {
    number: string;
    eyebrow: string;
    heading: string;
    lede: string;
    cta: { label: string; href: string };
    posts: { href: string; date: string; title: string }[];
  };
  adventures: {
    number: string;
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    frames: Frame[];
  };
  elsewhere: {
    number: string;
    eyebrow: string;
    heading: string;
    note: string;
    rows: {
      href: string;
      kind: string;
      title: string;
      venue: string;
      year: string;
      secondHref?: string | null;
    }[];
  };
  contact: {
    number: string;
    eyebrow: string;
    heading: string;
    form: {
      heading: string;
      sub: string;
      topicLabel: string;
      topics: { id: string; label: string }[];
      submit: string;
      reply: string;
    };
    findMe: {
      heading: string;
      socials: { href: string; name: string; handle: string }[];
      place: string[];
    };
  };
  footer: {
    nav: { href: string; label: string }[];
    signoff: string;
    signoffHref: string | null;
  };
  notFound: {
    eyebrow: string;
    heading: string;
    linkLabel: string;
    linkHref: string;
  };
};

export const site = data as unknown as Site;
export default site;
