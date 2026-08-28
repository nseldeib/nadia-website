import styles from '../About.module.css';

/**
 * The places she has lived, cycling one at a time.
 *
 * Same 8s slot as every other rotation on the page, so it lands on the shared
 * beat instead of drifting against the photographs.
 *
 * The longest city is also rendered once, hidden but in flow. Every visible
 * city is absolutely positioned, so without it this span would hold no in-flow
 * text — and an inline-block with no text has no baseline to align on, which
 * dropped this value a few pixels below the other facts in its row. The sizer
 * gives the span a real baseline and reserves the widest name's width, so the
 * row neither reflows as the cities cycle nor sits low against its siblings.
 */
export default function CityRotator({ cities }: { cities: string[] }) {
  const longest = cities.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <span className={styles.cities}>
      <span className={styles.citiesSizer} aria-hidden="true">
        {longest}
      </span>
      {cities.map((c, i) => (
        <i key={c} style={{ animationDelay: `${i * 8}s` }}>{c}</i>
      ))}
    </span>
  );
}
