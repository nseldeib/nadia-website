import styles from '../About.module.css';
import CityRotator from './CityRotator';

/**
 * The standing facts.
 *
 * A fact with no value is the one that rotates: "previously based in" has a
 * list behind it rather than a single answer.
 */
export default function AboutFacts({
  facts,
  cities,
}: {
  facts: { label: string; value: string }[];
  cities: string[];
}) {
  return (
    <dl className={styles.facts}>
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value || <CityRotator cities={cities} />}</dd>
        </div>
      ))}
    </dl>
  );
}
