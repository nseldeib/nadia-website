import site from '@/content/site';
import SectionHead from './SectionHead';
import PostList from './writing/PostList';
import WritingIntro from './writing/WritingIntro';
import section from './Section.module.css';
import styles from './Writing.module.css';

export default function Writing() {
  const { writing } = site;

  return (
    <section className={section.section} id="writing">
      <div className={section.wrap}>
        <div className={styles.top}>
          <div>
            <SectionHead n={writing.number} eyebrow={writing.eyebrow} />
            <h2 className={section.heading}>{writing.heading}</h2>
          </div>
          <WritingIntro lede={writing.lede} cta={writing.cta} />
        </div>

        <PostList posts={writing.posts} />
      </div>
    </section>
  );
}
