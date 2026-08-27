import Image from 'next/image';
import styles from './PhotoRotator.module.css';

export type Frame = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type Props = {
  frames: Frame[];
  /** Container aspect. Must equal each frame's own aspect, or `cover` crops. */
  aspect: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Every rotation on the page shares this slot, so all fades land on one beat. */
const SLOT_SECONDS = 8;

/**
 * Cross-fades a set of photographs on the shared cadence.
 *
 * A four-frame set runs 32s, a three-frame set 24s — every period is a
 * multiple of the slot, so fades happen together and the page is still in
 * between. Unsynchronised timers were what made it feel restless: something
 * was always mid-fade somewhere.
 *
 * Frames are pre-cropped to a single aspect and the container is set to that
 * same aspect, so nothing is enlarged or trimmed at render time.
 */
export default function PhotoRotator({
  frames,
  aspect,
  className,
  sizes = '(max-width: 860px) 100vw, 50vw',
  priority = false,
}: Props) {
  const period = SLOT_SECONDS * frames.length;

  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(' ')}
      data-frames={frames.length}
      style={{ aspectRatio: String(aspect) }}
    >
      {frames.map((frame, i) => (
        <Image
          key={frame.src}
          className={styles.photo}
          src={frame.src}
          alt={frame.alt}
          width={frame.width}
          height={frame.height}
          sizes={sizes}
          priority={priority && i === 0}
          style={{
            animationDuration: `${period}s`,
            animationDelay: `${i * SLOT_SECONDS}s`,
          }}
        />
      ))}
    </div>
  );
}
