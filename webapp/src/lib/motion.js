/**
 * Motion helpers — intentional, restrained (desktop-first).
 */

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isCoarsePointer() {
  return window.matchMedia('(hover: none), (max-width: 767px)').matches;
}

/**
 * @param {(progress: number) => void} onProgress
 */
export function bindScrollProgress(onProgress) {
  const update = () => {
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    onProgress(Math.min(Math.max(window.scrollY / max, 0), 1));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

/**
 * Hero image Ken Burns + parallax tied to scroll within hero.
 * @param {HTMLElement} imgWrap
 * @param {HTMLElement} hero
 */
export function bindHeroParallax(imgWrap, hero) {
  if (prefersReducedMotion() || isCoarsePointer()) return () => {};

  const onScroll = () => {
    const rect = hero.getBoundingClientRect();
    const view = window.innerHeight || 1;
    // 0 at top aligned, 1 as hero leaves
    const p = Math.min(Math.max(-rect.top / (rect.height + view * 0.2), 0), 1);
    const scale = 1.08 - p * 0.06;
    const y = p * 12;
    imgWrap.style.transform = `translate3d(0, ${y}%, 0) scale(${scale})`;
    imgWrap.style.opacity = String(1 - p * 0.35);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * @param {ParentNode} root
 * @param {string} selector
 */
export function bindReveals(root, selector = '.reveal') {
  if (prefersReducedMotion()) {
    root.querySelectorAll(selector).forEach((el) => el.classList.add('reveal-in'));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: '0px 0px -10% 0px' }
  );

  root.querySelectorAll(selector).forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/**
 * Cursor spotlight on card border (desktop only).
 * @param {HTMLElement} el
 */
export function bindCardTilt(el) {
  if (prefersReducedMotion() || isCoarsePointer()) return () => {};

  const onMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    el.style.setProperty('--spot-x', `${x}%`);
    el.style.setProperty('--spot-y', `${y}%`);
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    el.style.transform = '';
    el.style.removeProperty('--spot-x');
    el.style.removeProperty('--spot-y');
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    onLeave();
  };
}
