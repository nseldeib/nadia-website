import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import About from '@/components/About';
import Writing from '@/components/Writing';
import Adventures from '@/components/Adventures';
import Elsewhere from '@/components/Elsewhere';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { recentPostsForHome } from '@/app/lib/posts';

/* The Writing section now reads real posts, so the page is rendered per
   request — a cached render would freeze whichever posts existed at build
   time, and would hand every scenario the same world regardless of its seed. */
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Never throws: a database or Substack failure costs this section its three
  // links, not the homepage. See `recentPostsForHome`.
  const posts = await recentPostsForHome(3);

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
