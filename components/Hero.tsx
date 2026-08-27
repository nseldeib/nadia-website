import site from '@/content/site';
import HeroBackdrop from './hero/HeroBackdrop';
import ScrollCue from './hero/ScrollCue';
import TypedHeadline from './hero/TypedHeadline';
import styles from './Hero.module.css';

export default function Hero() {
  const { hero } = site;

  return (
    <header className={styles.hero} id="top">
      <HeroBackdrop frames={hero.frames} />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <TypedHeadline lines={hero.headline} />
        <p className={styles.lead}>{hero.lead}</p>
        <p className={styles.role}>
          <span className={styles.dot} aria-hidden="true" />
          {hero.role}
        </p>
      </div>

      <ScrollCue href="#work" label={hero.cueLabel} title={hero.cueTitle} />
    </header>
  );
}
