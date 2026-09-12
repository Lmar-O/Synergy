"use client";

import { useEffect, useRef } from "react";

/** [scroll progress, L, C, H, alpha] — an oklch colour at a point down the page. */
type Stop = readonly [number, number, number, number, number];

// One stop list per bloom: soft washes at low alpha whose hue drifts as the
// reader scrolls. Bloom 4 fades in mid-page and back out at the bottom.
const STOPS: readonly (readonly Stop[])[] = [
  [
    [0.0, 76, 0.18, 345, 0.34], // pink-red hero touch
    [0.35, 76, 0.18, 320, 0.3], // pink-violet
    [0.65, 74, 0.17, 350, 0.28], // pink-red
    [1.0, 76, 0.15, 30, 0.26], // warm peach
  ],
  [
    [0.0, 82, 0.14, 260, 0.16], // light periwinkle centre wash
    [0.3, 80, 0.16, 300, 0.16], // soft purple
    [0.65, 78, 0.17, 330, 0.16], // soft pink
    [1.0, 80, 0.14, 10, 0.14], // blush
  ],
  [
    [0.0, 80, 0.14, 220, 0.26], // soft blue-periwinkle
    [0.3, 78, 0.16, 265, 0.28], // periwinkle
    [0.6, 76, 0.17, 295, 0.28], // violet
    [1.0, 74, 0.16, 340, 0.26], // pink
  ],
  [
    [0.0, 82, 0.16, 40, 0.0], // invisible
    [0.35, 80, 0.18, 20, 0.22], // warm orange-red fades in
    [0.6, 78, 0.18, 350, 0.24], // rose
    [0.85, 76, 0.16, 320, 0.18], // pink fading
    [1.0, 78, 0.12, 300, 0.0], // gone
  ],
];

/** How far each bloom drifts by the bottom of the page, in px: [x, y]. */
const DRIFT = [
  [-80, 120],
  [60, 100],
  [-70, 110],
  [50, -60],
] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function sampleStops(stops: readonly Stop[], p: number): string {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, l0, c0, h0, a0] = stops[i];
    const [p1, l1, c1, h1, a1] = stops[i + 1];
    if (p >= p0 && p <= p1) {
      const t = smoothstep(p0, p1, p);
      // Take the short way round the hue wheel.
      let dh = h1 - h0;
      if (dh > 180) dh -= 360;
      if (dh < -180) dh += 360;
      return `oklch(${lerp(l0, l1, t).toFixed(1)}% ${lerp(c0, c1, t).toFixed(3)} ${(h0 + dh * t).toFixed(1)} / ${lerp(a0, a1, t).toFixed(3)})`;
    }
  }
  const [, l, c, h, a] = stops[stops.length - 1];
  return `oklch(${l}% ${c} ${h} / ${a})`;
}

/**
 * The drifting gradient washes behind the landing page, ported from the
 * design's inline script.
 *
 * Styles go straight onto the nodes each frame rather than through state —
 * re-rendering at 60fps to move four blurred divs would be absurd. And unlike
 * the static page it came from, this one has to stop: without the
 * cancelAnimationFrame cleanup, a client-side navigation to /app would leave
 * the loop running for the rest of the session.
 */
export function LandingBloom() {
  const blooms = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const offsets = DRIFT.map(() => ({ x: 0, y: 0 }));
    let progress = 0;
    let frame = 0;

    const update = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      // Heavy smoothing is what makes the motion languid rather than
      // scroll-locked.
      progress = lerp(progress, window.scrollY / maxScroll, 0.03);

      blooms.current.forEach((node, i) => {
        if (!node) return;
        const [dx, dy] = DRIFT[i];
        const offset = offsets[i];
        offset.x = lerp(offset.x, dx * progress, 0.04);
        offset.y = lerp(offset.y, dy * progress, 0.04);
        node.style.transform = `translate(${offset.x}px,${offset.y}px)`;
        node.style.background = sampleStops(STOPS[i], progress);
      });

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="bloom-layer" aria-hidden="true">
      {STOPS.map((_, i) => (
        <div
          key={i}
          ref={(node) => {
            blooms.current[i] = node;
          }}
          className={`bloom bloom-${i + 1}`}
        />
      ))}
    </div>
  );
}
