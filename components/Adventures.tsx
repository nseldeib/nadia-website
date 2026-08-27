import site from '@/content/site';
import PhotoRotator from './PhotoRotator';
import SectionHead from './SectionHead';
import section from './Section.module.css';
import styles from './Adventures.module.css';

/**
 * Three paragraphs and one rotating frame — the section used to be six
 * captioned cards across three grid blocks, which was more structure than the
 * content had. The two captions that carried real content (fencing, travel)
 * became paragraphs; the rest were a line each and the opening paragraph
 * already covers them.
 */
export default function Adventures() {
  const { adventures } = site;

  return (
    <section className={section.section} id="adventures">
      <div className={section.wrap}>
        <SectionHead n={adventures.number} eyebrow={adventures.eyebrow} />
        <h2 className={section.heading}>{adventures.heading}</h2>

        <div className={styles.grid}>
          <div className={section.body}>
            {adventures.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {/* 1.28 is the widest frame the snowboard source fills without
              cropping her arms; every other photo fits inside it. */}
          <PhotoRotator
            frames={adventures.frames}
            aspect={1.28}
            className={styles.frame}
            sizes="(max-width: 860px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
