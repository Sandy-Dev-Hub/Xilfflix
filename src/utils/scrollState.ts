let lastScrollTime = 0;
let isScrolling = false;
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  const onScroll = () => {
    lastScrollTime = Date.now();
    isScrolling = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 280);
  };

  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('wheel', onScroll, { passive: true, capture: true });
  window.addEventListener('touchmove', onScroll, { passive: true, capture: true });
}

export function isUserScrolling(): boolean {
  return isScrolling || (Date.now() - lastScrollTime < 280);
}
