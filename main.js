/* XoDos-Ark Mobile Auto-Scale & Glass UI Engine */
(function() {
  'use strict';

  // 1. Mobile Viewport Height Adapter (fixes mobile browser address bar jumps)
  function updateViewportUnits() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vvh', vh + 'px');
  }
  updateViewportUnits();
  window.addEventListener('resize', updateViewportUnits, { passive: true });
  window.addEventListener('orientationchange', updateViewportUnits, { passive: true });

  // 2. Reveal animations (Low-power IntersectionObserver)
  var revealElements = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(function(el) { el.classList.add('in'); });
  } else {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(function(el) { observer.observe(el); });
  }

  // 3. Mobile Glass Menu Controller
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  menu.addEventListener('click', function(event) {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', function(event) {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  }, { passive: true });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeMenu();
  });
})();
