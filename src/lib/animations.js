import { waapi } from "animejs/waapi";
import { createTimeline } from "animejs/timeline";
const motion = matchMedia("(prefers-reduced-motion: reduce)");
export function observeAssets(root = document) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || target.closest("[hidden]")) return;
        target.src = target.dataset.src;
        delete target.dataset.src;
        observer.unobserve(target);
      }),
    { rootMargin: "0px", threshold: 0.01 },
  );
  root
    .querySelectorAll("img[data-src]")
    .forEach((image) => observer.observe(image));
  return () => observer.disconnect();
}
export function initAnimations() {
  const running = new Map();
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target, isIntersecting }) => {
        const visible =
          isIntersecting && !document.hidden && !target.closest("[hidden]");
        if (target.hasAttribute("data-reveal") && visible && !motion.matches)
          target.classList.add("animate__animated", "animate__fadeInUp");
        if (motion.matches) return;
        if (!running.has(target) && visible && target.matches(".hero-world")) {
          const animations = [];
          const crystals = target.querySelectorAll(".crystal");
          if (crystals.length)
            animations.push(
              createTimeline({
                loop: true,
                alternate: true,
                autoplay: false,
              }).add(crystals, {
                opacity: [0.45, 1],
                scale: [0.94, 1.06],
                duration: 1900,
                ease: "inOutSine",
              }),
            );
          const coins = target.querySelectorAll(".vcoin");
          if (coins.length)
            animations.push(
              waapi.animate(coins, {
                translateY: [0, -14],
                duration: 2500,
                alternate: true,
                loop: true,
                ease: "inOutSine",
                autoplay: false,
              }),
            );
          running.set(target, animations);
        }
        running
          .get(target)
          ?.forEach((animation) =>
            visible ? animation.resume() : animation.pause(),
          );
      }),
    { threshold: 0.05 },
  );
  document
    .querySelectorAll("[data-reveal],.hero-world")
    .forEach((el) => observer.observe(el));
  const pause = () => {
    if (document.hidden || motion.matches)
      running.forEach((list) => list.forEach((a) => a.pause()));
  };
  document.addEventListener("visibilitychange", pause);
  motion.addEventListener("change", pause);
  document.querySelectorAll(".game-button").forEach((button) => {
    button.addEventListener("pointerenter", () => {
      if (!motion.matches)
        waapi.animate(button, {
          translateY: -3,
          duration: 180,
          ease: "outQuad",
        });
    });
    button.addEventListener("pointerleave", () => {
      if (!motion.matches)
        waapi.animate(button, {
          translateY: 0,
          duration: 180,
          ease: "outQuad",
        });
    });
  });
  return () => {
    observer.disconnect();
    running.forEach((list) => list.forEach((a) => a.cancel()));
    document.removeEventListener("visibilitychange", pause);
    motion.removeEventListener("change", pause);
  };
}
