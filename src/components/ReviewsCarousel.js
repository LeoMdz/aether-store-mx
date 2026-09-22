import { animate } from "animejs/animation";
const reviews = Array.from(
  { length: 16 },
  (_, i) => `/assets/reviews/review-${String(i + 1).padStart(2, "0")}.jpeg`,
);
export function ReviewsCarousel() {
  return `<section class="reviews-section container" aria-labelledby="reviews-title"><div class="section-heading"><div><p class="eyebrow">LA COMUNIDAD TIENE LA PALABRA</p><h2 id="reviews-title">LO QUE DICEN<br><span>NUESTROS CLIENTES.</span></h2><p>Reseñas reales, directamente desde nuestro Discord.</p></div><div class="review-arrows"><button class="outline-button" data-review-prev aria-label="Reseña anterior">←</button><button class="outline-button" data-review-next aria-label="Reseña siguiente">→</button></div></div><div class="review-track" tabindex="0" role="region" aria-label="Reseñas de clientes" aria-roledescription="carrusel" data-lenis-prevent>${reviews.map((src, i) => `<figure class="review-slide" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${reviews.length}"><img data-review-src="${src}" loading="lazy" decoding="async" alt="Reseña de cliente Aether Store"><figcaption>${String(i + 1).padStart(2, "0")} / ${reviews.length} · DISCORD</figcaption></figure>`).join("")}</div><div class="review-controls"><p data-review-status aria-live="polite">Reseña 1 de ${reviews.length}</p><div class="review-dots" aria-label="Elegir reseña">${reviews.map((_, i) => `<button aria-label="Ver reseña ${i + 1}" data-review-dot="${i}" aria-current="${i === 0}"><span></span></button>`).join("")}</div><span>DESLIZA PARA EXPLORAR</span></div></section>`;
}
export function initReviewsCarousel() {
  const root = document.querySelector(".reviews-section"),
    track = root.querySelector(".review-track"),
    slides = [...track.children],
    dots = [...root.querySelectorAll("[data-review-dot]")];
  let current = 0,
    motion,
    frame;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const load = (i) => {
    for (
      let j = Math.max(0, i - 1);
      j <= Math.min(slides.length - 1, i + 1);
      j++
    ) {
      const img = slides[j].querySelector("img");
      if (!img.src) img.src = img.dataset.reviewSrc;
    }
  };
  const update = () => {
    current = slides.reduce(
      (best, s, i) =>
        Math.abs(s.offsetLeft - track.offsetLeft - track.scrollLeft) <
        Math.abs(slides[best].offsetLeft - track.offsetLeft - track.scrollLeft)
          ? i
          : best,
      0,
    );
    dots.forEach((d, i) =>
      d.setAttribute("aria-current", String(i === current)),
    );
    root.querySelector("[data-review-status]").textContent =
      `Reseña ${current + 1} de ${slides.length}`;
    root.querySelector("[data-review-prev]").disabled = current === 0;
    root.querySelector("[data-review-next]").disabled =
      current === slides.length - 1;
    load(current);
  };
  const stop = () => {
    motion?.cancel();
    track.style.scrollSnapType = "";
  };
  const go = (i) => {
    stop();
    i = Math.max(0, Math.min(slides.length - 1, i));
    load(i);
    const left = slides[i].offsetLeft - track.offsetLeft;
    if (reduced.matches) {
      track.scrollLeft = left;
      update();
      return;
    }
    track.style.scrollSnapType = "none";
    motion = animate(track, {
      scrollLeft: left,
      duration: 460,
      ease: "outCubic",
      onComplete: () => {
        track.style.scrollSnapType = "";
        update();
      },
    });
  };
  const observer = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        load(current);
      } else {
        stop();
      }
    },
    { rootMargin: "0px" },
  );
  observer.observe(root);
  track.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  track.addEventListener("pointerdown", stop, { passive: true });
  track.addEventListener("wheel", stop, { passive: true });
  track.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      go(
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? slides.length - 1
            : current + (e.key === "ArrowRight" ? 1 : -1),
      );
    }
  });
  root
    .querySelector("[data-review-prev]")
    .addEventListener("click", () => go(current - 1));
  root
    .querySelector("[data-review-next]")
    .addEventListener("click", () => go(current + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  root.querySelector("[data-review-prev]").disabled = true;
}
