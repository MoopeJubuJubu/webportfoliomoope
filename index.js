// index.js — small interactive enhancements for the portfolio
// - smooth scroll for in-page nav links
// - simple lightbox for project images (progressive enhancement)
// - keyboard navigation (Esc, ←, →)
// - reveal-on-scroll for project cards

(function () {
  'use strict';

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Smooth scroll for internal nav links
  function initSmoothScroll() {
    const links = $$('a[href^="#"]');
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        // let links to top-level anchors behave normally if they are empty
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // update history for nicer UX
          if (history && history.pushState) {
            history.pushState(null, '', href);
          }
        }
      });
    });
  }

  // Lightbox implementation
  function initLightbox() {
    const lightbox = $('#lightbox');
    if (!lightbox) return;

    const imgEl = $('.lightbox-img', lightbox);
    const captionEl = $('.lightbox-caption', lightbox);
    const closeBtn = $('.lightbox-close', lightbox);
    const prevBtn = $('.lightbox-prev', lightbox);
    const nextBtn = $('.lightbox-next', lightbox);
    const backdrop = $('.lightbox-backdrop', lightbox);

    const cards = $$('.project-card');
    if (!cards.length) return;

    // Build an array of image sources and captions for navigation
    const gallery = cards.map(card => ({
      href: card.getAttribute('href'),
      caption: card.dataset.caption || card.querySelector('h3')?.textContent || '',
    }));

    let current = -1;

    function show(index) {
      if (index < 0 || index >= gallery.length) return;
      const item = gallery[index];
      imgEl.src = item.href;
      imgEl.alt = item.caption || '';
      captionEl.textContent = item.caption || '';
      lightbox.setAttribute('aria-hidden', 'false');
      current = index;
      // focus close for keyboard users
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }

    function hide() {
      lightbox.setAttribute('aria-hidden', 'true');
      imgEl.src = '';
      captionEl.textContent = '';
      current = -1;
      document.body.style.overflow = '';
    }

    function showNext() { show((current + 1) % gallery.length); }
    function showPrev() { show((current - 1 + gallery.length) % gallery.length); }

    // Click on a project card opens lightbox (progressive enhancement)
    cards.forEach((card, i) => {
      card.addEventListener('click', (ev) => {
        // If the user used ctrl/cmd click, let browser open a new tab
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
        // If link points to a non-image or is an anchor, skip
        const href = card.getAttribute('href');
        if (!href) return;
        ev.preventDefault();
        show(i);
      });
    });

    // Make certificate thumbnails open in the lightbox as well
    const certLinks = $$('.cert-link');
    certLinks.forEach(link => {
      link.addEventListener('click', (ev) => {
        // allow ctrl/cmd to open new tab
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        const href = link.getAttribute('href');
        if (!href) return;
        // push the cert into the current gallery view (temporary)
        imgEl.src = href;
        imgEl.alt = link.getAttribute('title') || '';
        captionEl.textContent = link.dataset.caption || link.getAttribute('title') || '';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close handlers
    closeBtn.addEventListener('click', hide);
    backdrop.addEventListener('click', hide);

    // Prev/Next
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (lightbox.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

  // Reveal-on-scroll using IntersectionObserver
  function initRevealOnScroll() {
    const cards = $$('.project-card');
    if (!('IntersectionObserver' in window) || !cards.length) {
      // fallback: reveal all
      cards.forEach(c => c.classList.add('is-revealed'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(c => obs.observe(c));
  }


  document.addEventListener('DOMContentLoaded', () => {
    try {
      initSmoothScroll();
      initRevealOnScroll();
      initLightbox();


      const hamburger = document.querySelector('.hamburger');
      if (hamburger) {
        hamburger.addEventListener('click', () => {
          const targetSel = hamburger.dataset.target;
          if (!targetSel) return;
          const target = document.querySelector(targetSel);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }

    } catch (err) {
      
    }
  });

})();
