import site from '@/content/site';
import ContactForm from './ContactForm';
import SectionHead from './SectionHead';
import FindMe from './contact/FindMe';
import section from './Section.module.css';

/**
 * One section, two blocks: the note and the profiles. They answer the same
 * reader need ("how do I reach her"), so they share a destination and a
 * section number rather than competing as two sections.
 */
export default function Contact() {
  const { contact } = site;

  return (
    <section className={section.section} id="contact">
      <div className={section.wrap}>
        <SectionHead n={contact.number} eyebrow={contact.eyebrow} />
        <h2 className={section.heading}>{contact.heading}</h2>

        <ContactForm />

        <FindMe
          heading={contact.findMe.heading}
          socials={contact.findMe.socials}
          place={contact.findMe.place}
        />
      </div>
    </section>
  );
}
