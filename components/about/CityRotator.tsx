import styles from '../About.module.css';

/**
 * The places she has lived, cycling one at a time.
 *
 * Same 8s slot as every other rotation on the page, so it lands on the shared
 * beat instead of drifting against the photographs.
 */
export default function CityRotator({ cities }: { cities: string[] }) {
  return (
    <span className={styles.cities}>
      {cities.map((c, i) => (
        <i key={c} style={{ animationDelay: `${i * 8}s` }}>{c}</i>
      ))}
    </span>
  );
}
