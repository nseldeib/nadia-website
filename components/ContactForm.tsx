'use client';

import { useState } from 'react';
import site from '@/content/site';
import { submitMessage } from '@/app/lib/submitMessage';
import type { Problems } from '@/app/lib/validateMessage';
import Field from './contact/Field';
import FormFailure from './contact/FormFailure';
import Honeypot from './contact/Honeypot';
import SentConfirmation from './contact/SentConfirmation';
import TopicChips from './contact/TopicChips';
import styles from './Contact.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * The note form.
 *
 * On success the form is replaced by a confirmation — clearest signal it
 * worked, and it makes a duplicate send impossible. On failure the draft is
 * kept and the profiles below are offered as another route, because there is
 * deliberately no email address anywhere on this site to fall back to.
 */
export default function ContactForm() {
  const { form, findMe } = site.contact;
  const [status, setStatus] = useState<Status>('idle');
  const [problems, setProblems] = useState<Problems>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [values, setValues] = useState({
    topic: form.topics[0]?.id ?? 'hello',
    name: '',
    email: '',
    body: '',
    company: '', // honeypot
  });

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setProblems({});
    setFailure(null);

    const result = await submitMessage(values, window.location.pathname);
    if (result.kind === 'sent') {
      setStatus('sent');
      return;
    }
    if (result.kind === 'invalid') {
      setProblems(result.problems);
      setStatus('idle');
      return;
    }
    // Everything the visitor typed stays put — nothing is cleared on failure.
    setFailure(result.message);
    setStatus('error');
  }

  if (status === 'sent') return <SentConfirmation reply={form.reply} />;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h3 className={styles.formHeading}>{form.heading}</h3>
      <p className={styles.formSub}>{form.sub}</p>

      <TopicChips
        legend={form.topicLabel}
        topics={form.topics}
        value={values.topic}
        onChange={(id) => setValues((v) => ({ ...v, topic: id }))}
      />

      <div className={`${styles.field} ${styles.row2}`}>
        <Field id="name" label="Name" problem={problems.name}>
          <input
            id="name"
            className={styles.input}
            value={values.name}
            onChange={set('name')}
            aria-invalid={problems.name ? true : undefined}
            autoComplete="name"
          />
        </Field>
        <Field id="email" label="Email" problem={problems.email}>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={values.email}
            onChange={set('email')}
            aria-invalid={problems.email ? true : undefined}
            autoComplete="email"
          />
        </Field>
      </div>

      <div className={styles.field}>
        <Field id="body" label="Message" problem={problems.body}>
          <textarea
            id="body"
            className={styles.textarea}
            value={values.body}
            onChange={set('body')}
            aria-invalid={problems.body ? true : undefined}
            rows={5}
          />
        </Field>
      </div>

      <Honeypot value={values.company} onChange={set('company')} />

      {status === 'error' && failure ? (
        <FormFailure message={failure} socials={findMe.socials} />
      ) : null}

      <div className={styles.foot}>
        <button className={styles.submit} type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : form.submit}
        </button>
        <span className={styles.reply}>{form.reply}</span>
      </div>
    </form>
  );
}
