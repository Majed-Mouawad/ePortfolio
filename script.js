const root = document.documentElement;
const year = document.querySelector("#year");
const revealElements = document.querySelectorAll(".reveal");
const navigationLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = navigationLinks
  .map((link) => document.querySelector(link.hash))
  .filter((section) => section !== null);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");

let viewportFrame = 0;
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;

root.classList.add("motion-ready");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const updateViewportEffects = () => {
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  const activationLine = window.innerHeight * 0.4;
  let activeSection = null;

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeSection = section;
    }
  });

  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));

  navigationLinks.forEach((link) => {
    link.classList.toggle("is-active", activeSection?.id === link.hash.slice(1));
  });

  viewportFrame = 0;
};

const scheduleViewportUpdate = () => {
  if (viewportFrame === 0) {
    viewportFrame = window.requestAnimationFrame(updateViewportEffects);
  }
};

window.addEventListener("scroll", scheduleViewportUpdate, { passive: true });
window.addEventListener("resize", scheduleViewportUpdate, { passive: true });
scheduleViewportUpdate();

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

if (!reducedMotion.matches && finePointer.matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (pointerFrame !== 0) {
        return;
      }

      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${pointerX}px`);
        root.style.setProperty("--pointer-y", `${pointerY}px`);
        pointerFrame = 0;
      });
    },
    { passive: true }
  );
}
