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
    frames: { src: string; width: number; height: number }[];
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
      summary: string;
      bullets: string[];
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
};

export const site = data as unknown as Site;
export default site;
