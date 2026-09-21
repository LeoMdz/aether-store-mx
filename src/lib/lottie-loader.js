// Only the one-shot brand loader is Lottie. No decorative background loops.
let played = false;
let active = 0;
export function initLogoLottie() {
  const container = document.querySelector("#logo-lottie");
  if (!container) return;
  if (played || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    container.remove();
    return;
  }
  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries.some((e) => e.isIntersecting) || played || active >= 2)
        return;
      played = true;
      observer.disconnect();
      active++;
      try {
        const [{ default: lottie }, response] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch("/assets/lottie/logo-intro.json"),
        ]);
        if (!response.ok) throw new Error("Lottie unavailable");
        const animation = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData: await response.json(),
        });
        const cleanup = () => {
          animation.destroy();
          container.remove();
          active--;
        };
        animation.addEventListener("complete", cleanup);
        animation.addEventListener("data_failed", cleanup);
        animation.addEventListener("DOMLoaded", () => animation.play());
      } catch {
        container.remove();
        active--;
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(container);
}
