import { useEffect } from 'react';

/**
 * Global Scroll & Entrance Reveal Hook (Pure JS)
 * Uses IntersectionObserver to trigger smooth CSS animations as elements scroll into view.
 */
export function useScrollReveal(selector = '.reveal-on-scroll, .reveal-fade-up, .reveal-scale, .reveal-slide-left, .reveal-slide-right') {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selector]);
}
