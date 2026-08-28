import site from '@/content/site';
import SectionHead from './SectionHead';
import PostList from './writing/PostList';
import WritingIntro from './writing/WritingIntro';
import WritingCta from './writing/WritingCta';
import section from './Section.module.css';

export default function Writing() {
  const { writing } = site;

  return (
    <section className={section.section} id="writing">
      <div className={section.wrap}>
        <SectionHead n={writing.number} eyebrow={writing.eyebrow} />
        <h2 className={section.heading}>{writing.heading}</h2>
        <WritingIntro lede={writing.lede} />

        <PostList posts={writing.posts} />

        <WritingCta cta={writing.cta} />
      </div>
    </section>
  );
}
