import Component from "../../../components/PhotoRotator";
import type { ComponentProps } from "react";
import site from "@/content/site";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The Work rotation: a portrait-aspect set on the shared eight-second slot.
  Default: { frames: site.work.frames, aspect: 0.8, sizes: "45vw", priority: true },
  // Adventures runs the widest frame in the set, so cropping shows up here first.
  Adventures: { frames: site.adventures.frames, aspect: 1.28, sizes: "50vw", priority: true },
  // A single frame never cross-fades, which is the degenerate case worth seeing.
  Single: { frames: site.work.frames.slice(0, 1), aspect: 0.8, sizes: "45vw", priority: true },
  // A two-frame set, which is the only one that selects the rotate2 keyframes,
  // and below the fold so nothing is preloaded. Deliberately opens on a
  // different photograph than the other sets: a capture freezes the first
  // frame, so two sets sharing an opening image would be indistinguishable.
  Deferred: {
    frames: site.adventures.frames.slice(2, 4),
    aspect: 1.28,
    sizes: "40vw",
    priority: false,
  },
  // Four frames stated literally, which is both the largest set on the page and
  // the only one that selects the rotate4 keyframes. A four-frame set runs 32s,
  // still a multiple of the shared eight-second slot.
  Many: {
    frames: [
      {
        src: "/images/graduating-from-harvard-college.jpg",
        alt: "Graduating from Harvard College",
        width: 800,
        height: 1000,
      },
      {
        src: "/images/riding-with-the-lyft-bikes-scooters-team-in-san-fran.jpg",
        alt: "Riding with the Lyft Bikes & Scooters team in San Francisco",
        width: 860,
        height: 1075,
      },
      {
        src: "/images/with-the-lyft-bikes-scooters-team-holding-a-bike-whe.jpg",
        alt: "With the Lyft Bikes & Scooters team, holding a bike wheel",
        width: 820,
        height: 1025,
      },
      {
        src: "/images/at-a-founders-day-event.jpg",
        alt: "At a founders day event",
        width: 860,
        height: 1075,
      },
    ],
    aspect: 0.8,
    sizes: "45vw",
    priority: false,
  },
  // No frames. The container should hold its aspect rather than collapse, so a
  // content file missing its photographs does not shift the whole section.
  Empty: { frames: [], aspect: 0.8, sizes: "45vw", priority: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div style={{ width: 520 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
