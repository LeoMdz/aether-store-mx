import { waapi } from "animejs/waapi";

const SESSION_KEY = "aether-welcome-seen";

/** One welcome per tab session. Never waits on an asset or animation to unlock. */
export function SplashScreen({
  lenis,
  root = document.querySelector("#app"),
} = {}) {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return Promise.resolve();
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // A blocked storage API must never prevent entering the store.
  }

  return new Promise((resolve) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const overlay = document.createElement("div");
    overlay.className = "splash-screen";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Bienvenido a Aether Store MX");
    overlay.tabIndex = -1;
    overlay.innerHTML = `<div class="splash-brand"><img src="/assets/images/logo.webp" width="256" height="256" alt="Aether Store MX"><p>TU SIGUIENTE NIVEL.</p></div><button class="splash-skip" type="button" hidden>Saltar <span aria-hidden="true">→</span></button>`;
    const previousFocus = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    const wasInert = root?.inert || false;
    if (root) root.inert = true;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    document.body.append(overlay);
    overlay.focus({ preventScroll: true });

    let finished = false;
    let exiting = false;
    const animations = [];
    const timers = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
      reduced.removeEventListener("change", finish);
      overlay.remove();
      if (root) root.inert = wasInert;
      document.documentElement.style.overflow = previousOverflow;
      lenis?.start();
      if (
        previousFocus &&
        previousFocus !== document.body &&
        previousFocus.isConnected
      )
        previousFocus.focus({ preventScroll: true });
      resolve();
    };
    const exit = () => {
      if (finished || exiting) return;
      exiting = true;
      if (reduced.matches) return finish();
      try {
        animations.push(
          waapi.animate(overlay, {
            opacity: [1, 0],
            duration: 400,
            ease: "outQuad",
          }),
        );
        timers.push(setTimeout(finish, 400));
      } catch {
        finish();
      }
    };

    overlay.querySelector(".splash-skip").addEventListener("click", exit);
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") exit();
      if (event.key === "Tab") {
        event.preventDefault();
        const skip = overlay.querySelector(".splash-skip");
        if (!skip.hidden) skip.focus();
      }
    });
    reduced.addEventListener("change", finish);
    // Hard deadline is independent of image loading and WAAPI completion.
    timers.push(setTimeout(finish, 2400));
    if (reduced.matches) {
      timers.push(setTimeout(finish, 600));
      return;
    }
    timers.push(
      setTimeout(() => {
        overlay.querySelector(".splash-skip").hidden = false;
      }, 1000),
    );
    try {
      const brand = overlay.querySelector(".splash-brand");
      animations.push(
        waapi.animate(brand, {
          opacity: [0, 1],
          scale: [0.88, 1],
          duration: 700,
          ease: "outCubic",
        }),
      );
      animations.push(
        waapi.animate(brand.querySelector("img"), {
          filter: [
            "drop-shadow(0 0 0px #cad7ef00)",
            "drop-shadow(0 0 22px #cad7ef50)",
          ],
          duration: 650,
          delay: 600,
          alternate: true,
          loop: 1,
          ease: "inOutSine",
        }),
      );
      timers.push(setTimeout(exit, 1750));
    } catch {
      finish();
    }
  });
}
