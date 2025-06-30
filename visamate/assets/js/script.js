'use strict';

/* ────────────────────────────────────────────────────────── */
/* 1) ON LOAD: if there's a hash in the URL, remove it and  */
/*    instantly jump to top so a reload never scrolls you.  */
/* ────────────────────────────────────────────────────────── */
if (window.location.hash) {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
  window.scrollTo(0, 0);
}

/* ────────────────────────────────────────────────────────── */
/* 2) SMOOTH SCROLL HANDLER */
/* ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetID = anchor.getAttribute('href');
    const targetEl = document.querySelector(targetID);
    if (!targetEl) return;
    e.preventDefault();

    document.querySelector('[data-navbar].active')?.classList.remove('active');
    document.querySelector('[data-overlay].active')?.classList.remove('active');
    document.body.classList.remove('nav-active');

    targetEl.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, document.title, targetID);
  });
});

/**
 * NAVBAR TOGGLE
 */
const overlay = document.querySelector('[data-overlay]');
const navOpenBtn = document.querySelector('[data-nav-open-btn]');
const navCloseBtn = document.querySelector('[data-nav-close-btn]');
const navbar = document.querySelector('[data-navbar]');
const navLinks = document.querySelectorAll('[data-nav-link]');

const navElemArr = [navOpenBtn, navCloseBtn, overlay];
const navToggleEvent = elems => {
  elems.forEach(elem => {
    if (!elem) return;
    elem.addEventListener('click', () => {
      navbar.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.classList.toggle('nav-active');
    });
  });
};

navToggleEvent(navElemArr);
navToggleEvent(Array.from(navLinks));

/**
 * HEADER STICKY & GO TO TOP (modular)
 */
function setupGoTopButton() {
  const goTopBtn = document.querySelector('[data-go-top]');
  const header = document.querySelector('[data-header]');

  if (!goTopBtn || !header) return;

  window.addEventListener('scroll', () => {
    const active = window.scrollY >= 200;
    header.classList.toggle('active', active);
    goTopBtn.classList.toggle('active', active);
  });

  goTopBtn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * TESTIMONIAL CAROUSEL (unchanged)
 */
const carousel = document.querySelector('.carousel');
const cards = Array.from(carousel?.querySelectorAll('.card') || []);
const dots = document.querySelectorAll('.carousel-indicators .dot');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

if (carousel && cards.length && dots.length === cards.length && prevBtn && nextBtn) {
  let current = cards.findIndex(c => c.classList.contains('active'));
  if (current < 0) current = 0;

  const DURATION = 5000;
  let autoTimer;

  function scrollToSlide(idx) {
    const slide = cards[idx];
    const offset = slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2;
    carousel.scrollTo({ left: offset, behavior: 'smooth' });
  }

  function goTo(idx) {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    scrollToSlide(idx);
    current = idx;
  }

  function next() { goTo((current + 1) % cards.length); }
  function prev() { goTo((current - 1 + cards.length) % cards.length); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, DURATION);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  let startX = 0;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); });
  carousel.addEventListener('touchmove', e => {
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 10) e.preventDefault();
  });
  carousel.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAuto();
  });

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  goTo(current);
  startAuto();
}

// nnews letter subscription
// ─── Footer newsletter validation & AJAX ─────────────────────────────
(function(){
  // Listen for when footer partial has loaded
  document.getElementById('include-footer')
    .addEventListener('partialLoaded', () => {

      const form       = document.getElementById('newsletter-form');
      const emailInput = document.getElementById('newsletter-email');
      const submitBtn  = document.getElementById('newsletter-submit');
      const errorSpan  = document.getElementById('newsletter-error');

      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorSpan.classList.remove('active');

        // 1) Built-in HTML5 validation
        if (!emailInput.checkValidity()) {
          if (emailInput.validity.valueMissing) {
            errorSpan.textContent = 'Email is required.';
          } else if (emailInput.validity.typeMismatch) {
            errorSpan.textContent = 'Please enter a valid email address.';
          }
          errorSpan.classList.add('active');
          return;
        }

        // 2) Prevent double-click
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing…';

        // 3) AJAX submit
        try {
          await fetch(form.action, {
            method: 'POST',
            body: new FormData(form)
          });

          // 4) Confirmation dialog
          const dlg = document.createElement('div');
          dlg.className = 'submission-dialog';
          dlg.innerHTML = `
            <div class="dialog-content">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <h2>Thank You!</h2>
              <p>You’ve been subscribed to our newsletter.</p>
              <button id="dialog-ok">OK</button>
            </div>`;
          document.body.appendChild(dlg);

          dlg.querySelector('#dialog-ok').addEventListener('click', () => dlg.remove());

          form.reset();
          submitBtn.textContent = 'Subscribe';
        } catch {
          errorSpan.textContent = 'Subscription failed. Please try again.';
          errorSpan.classList.add('active');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Subscribe';
        }
      });
  });
})();
