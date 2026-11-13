import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import About from '@/components/About';
import Writing from '@/components/Writing';
import Adventures from '@/components/Adventures';
import Elsewhere from '@/components/Elsewhere';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { after } from 'next/server';
import { recentPostsForHome, syncPostsQuietly } from '@/app/lib/posts';

/* The Writing section now reads real posts, so the page is rendered per
   request — a cached render would freeze whichever posts existed at build
   time, and would hand every scenario the same world regardless of its seed. */
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Never throws: a database or Substack failure costs this section its three
  // links, not the homepage. See `recentPostsForHome`.
  const posts = await recentPostsForHome(3);

  // Reconcile with Substack once the response is already sent, so a post
  // published today reaches the next visitor without anyone opening /writing
  // first, and this visitor never waits on the feed. The sync is a no-op while
  // the store is under an hour old, and a Substack outage is swallowed rather
  // than logged as unhandled. See `syncPostsQuietly`.
  after(syncPostsQuietly);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Writing posts={posts} />
        <Adventures />
        <Elsewhere />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
