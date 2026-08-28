import Image from 'next/image';
import styles from '../Hero.module.css';

/** The full-bleed rotation behind the headline, on the shared 8s beat. */
export default function HeroBackdrop({
  frames,
}: {
  frames: {
    src: string;
    width: number;
    height: number;
    focus?: string;
    focusMobile?: string;
  }[];
}) {
  return (
    <div className={styles.bg} aria-hidden="true" data-frames={frames.length}>
      {frames.map((f, i) => (
        <Image
          key={f.src}
          className={styles.frame}
          src={f.src}
          alt=""
          width={f.width}
          height={f.height}
          priority={i === 0}
          sizes="100vw"
          // The two crops are handed to CSS as custom properties rather than a
          // resolved `object-position`, because which one applies is a media
          // query's decision and this component never sees the viewport.
          style={
            {
              animationDuration: `${frames.length * 8}s`,
              animationDelay: `${i * 8}s`,
              '--focus': f.focus ?? '50% 50%',
              '--focus-mobile': f.focusMobile ?? f.focus ?? '50% 50%',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
