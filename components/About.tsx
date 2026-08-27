import site from '@/content/site';
import PhotoRotator from './PhotoRotator';
import SectionHead from './SectionHead';
import AboutFacts from './about/AboutFacts';
import section from './Section.module.css';
import styles from './About.module.css';

/**
 * The page's one light surface. It carries the most body copy, which is where
 * dark-on-light actually helps someone read — the earlier decorative band did
 * not earn the break; this does.
 */
export default function About() {
  const { about } = site;

  return (
    <section className={`${section.section} ${styles.about} surface-light`} id="about">
      <div className={section.wrap}>
        <SectionHead n={about.number} eyebrow={about.eyebrow} />
        <h2 className={section.heading}>{about.heading}</h2>

        <div className={styles.grid}>
          <PhotoRotator
            frames={about.frames}
            aspect={0.8}
            className={styles.portrait}
            sizes="(max-width: 860px) 100vw, 40vw"
          />
          <div className={section.body}>
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>

        <AboutFacts facts={about.facts} cities={about.cities} />
      </div>
    </section>
  );
}
