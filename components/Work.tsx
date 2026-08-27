import site from '@/content/site';
import PhotoRotator from './PhotoRotator';
import SectionHead from './SectionHead';
import AdvisoryCard from './work/AdvisoryCard';
import WorkNarrative from './work/WorkNarrative';
import section from './Section.module.css';
import styles from './Work.module.css';

export default function Work() {
  const { work } = site;

  return (
    <section className={section.section} id="work">
      <div className={section.wrap}>
        <SectionHead n={work.number} eyebrow={work.eyebrow} />
        <h2 className={section.heading}>{work.heading}</h2>

        <div className={styles.grid}>
          <WorkNarrative
            paragraphs={work.paragraphs}
            subhead={work.subhead}
            links={work.links}
            proof={work.proof}
          />
          <PhotoRotator
            frames={work.frames}
            aspect={0.8}
            sizes="(max-width: 860px) 100vw, 45vw"
          />
        </div>

        <AdvisoryCard
          label={work.advisory.label}
          body={work.advisory.body}
          summary={work.advisory.summary}
          bullets={work.advisory.bullets}
          cta={work.advisory.cta}
        />
      </div>
    </section>
  );
}
