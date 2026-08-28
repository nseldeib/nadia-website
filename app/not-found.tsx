import type { Metadata } from 'next';
import NotFound from '@/components/NotFound';

/* `noindex` so a crawler that reaches a dead URL drops it rather than keeping
   it in the index. The page still answers 404 — this only covers the case of a
   crawler that renders before it reads the status. */
export const metadata: Metadata = {
  title: 'Page not found · Nadia Eldeib',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFound />;
}
