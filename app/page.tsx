import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import About from '@/components/About';
import Writing from '@/components/Writing';
import Adventures from '@/components/Adventures';
import Elsewhere from '@/components/Elsewhere';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Writing />
        <Adventures />
        <Elsewhere />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
