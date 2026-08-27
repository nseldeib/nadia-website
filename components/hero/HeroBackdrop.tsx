import Image from 'next/image';
import styles from '../Hero.module.css';

/** The full-bleed rotation behind the headline, on the shared 8s beat. */
export default function HeroBackdrop({
  frames,
}: {
  frames: { src: string; width: number; height: number }[];
}) {
  return (
    <div className={styles.bg} aria-hidden="true">
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
          style={{ animationDelay: `${i * 8}s` }}
        />
      ))}
    </div>
  );
}
