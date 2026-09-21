import Lenis from "lenis";
import "lenis/dist/lenis.css";
let instance;
let frame;
export function initLenis() {
  if (instance || matchMedia("(prefers-reduced-motion: reduce)").matches)
    return instance;
  instance = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
  const tick = (time) => {
    instance.raf(time);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return instance;
}
export function destroyLenis() {
  if (frame) cancelAnimationFrame(frame);
  instance?.destroy();
  instance = undefined;
}
