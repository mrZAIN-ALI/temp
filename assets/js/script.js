"use strict";

/* ────────────────────────────────────────────────────────── */
/* 1) ON LOAD: if there's a hash in the URL, remove it and  */
/*    instantly jump to top so a reload never scrolls you.  */
/* ────────────────────────────────────────────────────────── */
if (window.location.hash) {
  history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search
  );
  window.scrollTo(0, 0);
}

/* ────────────────────────────────────────────────────────── */
/* 2) SMOOTH SCROLL HANDLER */
/* ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetID = anchor.getAttribute("href");
    const targetEl = document.querySelector(targetID);
    if (!targetEl) return;
    e.preventDefault();

    document.querySelector("[data-navbar].active")?.classList.remove("active");
    document.querySelector("[data-overlay].active")?.classList.remove("active");
    document.body.classList.remove("nav-active");

    targetEl.scrollIntoView({ behavior: "smooth" });
    history.pushState(null, document.title, targetID);
  });
});

/**
 * NAVBAR TOGGLE
 */
const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navbar = document.querySelector("[data-navbar]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];
const navToggleEvent = (elems) => {
  elems.forEach((elem) => {
    if (!elem) return;
    elem.addEventListener("click", () => {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.classList.toggle("nav-active");
    });
  });
};

navToggleEvent(navElemArr);
navToggleEvent(Array.from(navLinks));

/**
 * HEADER STICKY & GO TO TOP (modular)
 */
function setupGoTopButton() {
  const goTopBtn = document.querySelector("[data-go-top]");
  const header = document.querySelector("[data-header]");

  if (!goTopBtn || !header) return;

  window.addEventListener("scroll", () => {
    const active = window.scrollY >= 200;
    header.classList.toggle("active", active);
    goTopBtn.classList.toggle("active", active);
  });

  goTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/**
 * TESTIMONIAL CAROUSEL (unchanged)
 */
const carousel = document.querySelector(".carousel");
const cards = Array.from(carousel?.querySelectorAll(".card") || []);
const dots = document.querySelectorAll(".carousel-indicators .dot");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

if (
  carousel &&
  cards.length &&
  dots.length === cards.length &&
  prevBtn &&
  nextBtn
) {
  let current = cards.findIndex((c) => c.classList.contains("active"));
  if (current < 0) current = 0;

  const DURATION = 5000;
  let autoTimer;

  function scrollToSlide(idx) {
    const slide = cards[idx];
    const offset =
      slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2;
    carousel.scrollTo({ left: offset, behavior: "smooth" });
  }

  function goTo(idx) {
    cards.forEach((c, i) => c.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    scrollToSlide(idx);
    current = idx;
  }

  function next() {
    goTo((current + 1) % cards.length);
  }
  function prev() {
    goTo((current - 1 + cards.length) % cards.length);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, DURATION);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener("click", () => {
    stopAuto();
    prev();
    startAuto();
  });
  nextBtn.addEventListener("click", () => {
    stopAuto();
    next();
    startAuto();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      stopAuto();
      goTo(i);
      startAuto();
    })
  );

  let startX = 0;
  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    stopAuto();
  });
  carousel.addEventListener("touchmove", (e) => {
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 10) e.preventDefault();
  });
  carousel.addEventListener("touchend", (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAuto();
  });

  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);

  goTo(current);
  startAuto();
}

// nnews letter subscription
// ─── Footer newsletter validation & AJAX ─────────────────────────────
(function () {
  // Listen for when footer partial has loaded
  document
    .getElementById("include-footer")
    .addEventListener("partialLoaded", () => {
      const form = document.getElementById("newsletter-form");
      const emailInput = document.getElementById("newsletter-email");
      const submitBtn = document.getElementById("newsletter-submit");
      const errorSpan = document.getElementById("newsletter-error");

      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorSpan.classList.remove("active");

        // 1) Built-in HTML5 validation
        if (!emailInput.checkValidity()) {
          if (emailInput.validity.valueMissing) {
            errorSpan.textContent = "Email is required.";
          } else if (emailInput.validity.typeMismatch) {
            errorSpan.textContent = "Please enter a valid email address.";
          }
          errorSpan.classList.add("active");
          return;
        }

        // 2) Prevent double-click
        submitBtn.disabled = true;
        submitBtn.textContent = "Subscribing…";

        // 3) AJAX submit
        try {
          await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
          });

          // 4) Confirmation dialog
          const dlg = document.createElement("div");
          dlg.className = "submission-dialog";
          dlg.innerHTML = `
            <div class="dialog-content">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <h2>Thank You!</h2>
              <p>You’ve been subscribed to our newsletter.</p>
              <button id="dialog-ok">OK</button>
            </div>`;
          document.body.appendChild(dlg);

          dlg
            .querySelector("#dialog-ok")
            .addEventListener("click", () => dlg.remove());

          form.reset();
          submitBtn.textContent = "Subscribe";
        } catch {
          errorSpan.textContent = "Subscription failed. Please try again.";
          errorSpan.classList.add("active");
          submitBtn.disabled = false;
          submitBtn.textContent = "Subscribe";
        }
      });
    });
})();
async function loadPopupPartial() {
  const container = document.getElementById("popup-container");
  if (!container) return;
  const res = await fetch("/assets/partials/popup.html");
  const html = await res.text();
  container.innerHTML = html;

  // Wait for popup to load before showing it
  setTimeout(() => {
    document.getElementById("call-deal-popup").style.display = "flex";
  }, 1000); // Show popup after 1 second
}

function closePopup() {
  document.getElementById("call-deal-popup").style.display = "none";
}

window.addEventListener("DOMContentLoaded", loadPopupPartial);


// Tab switching (scoped)
document.querySelectorAll('.inquire-tabs .inquire-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.inquire-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.inquire-form-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + '-form').classList.add('active');
  });
});

// Submission + validation + dialog
['visa-form','flights-form'].forEach(id => {
  const form = document.getElementById(id);
  const btn  = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    // Clear prior errors
    form.querySelectorAll('input').forEach(i => i.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(em => em.style.display = 'none');

    // Disable button
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = 'Submitting...';

    // Validate required
    let valid = true;
    form.querySelectorAll('input[required]').forEach(i => {
      if (!i.checkValidity()) {
        valid = false;
        i.classList.add('error');
        i.closest('.inquire-field-group').querySelector('.error-message').style.display = 'block';
      }
    });
    if (!valid) {
      btn.disabled = false;
      btn.textContent = origText;
      return;
    }

    // Send via fetch with no-cors so FormSubmit receives it
    try {
      await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        mode: 'no-cors'
      });
      showSubmissionDialog();
      form.reset();
    } catch {
      alert('❌ Submission failed. Please try again.');
    }

    btn.disabled = false;
    btn.textContent = origText;
  });
});

// Show modal dialog
function showSubmissionDialog() {
  const d = document.createElement('div');
  d.className = 'submission-dialog';
  d.innerHTML = `
    <div class="dialog-content">
      <ion-icon name="checkmark-circle-outline"></ion-icon>
      <h2>Thank You!</h2>
      <p>Your inquiry has been submitted.<br/>We will contact you shortly.</p>
      <button id="dialog-ok">OK</button>
    </div>`;
  document.body.appendChild(d);

  d.querySelector('#dialog-ok').addEventListener('click', () => {
    d.remove();
  });
}





function setupMoreDropdown() {
  const moreBtn = document.getElementById('moreDropdownBtn');
  const moreDropdown = document.getElementById('moreDropdown');

  if (!moreBtn || !moreDropdown) return;

  // Toggle on click
  moreBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    moreDropdown.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', moreDropdown.classList.contains('open'));
  });

  // Close when clicking outside
  document.addEventListener('click', function() {
    if (moreDropdown.classList.contains('open')) {
      moreDropdown.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on link click (optional, for mobile)
  document.querySelectorAll('#moreDropdownMenu a').forEach(link => {
    link.addEventListener('click', function() {
      moreDropdown.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// If your header is loaded via partial/async:
if (document.getElementById('moreDropdownBtn')) {
  setupMoreDropdown();
} else {
  // If using includePartial or similar loader:
  const hdr = document.getElementById('include-header');
  if (hdr) {
    hdr.addEventListener('partialLoaded', setupMoreDropdown, { once: true });
  }
}


// maing navbar responsive
function setupMobileNavbar() {
  const overlay = document.querySelector('.overlay') || document.querySelector('[data-overlay]');
  const navOpenBtn = document.querySelector('[data-nav-open-btn]');
  const navCloseBtn = document.querySelector('[data-nav-close-btn]');
  const navbar = document.querySelector('[data-navbar]');

  if (!(navOpenBtn && navCloseBtn && navbar && overlay)) return;

  function openNav() {
    navbar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    navbar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  navOpenBtn.addEventListener('click', openNav);
  navCloseBtn.addEventListener('click', closeNav);
  overlay.addEventListener('click', closeNav);

  // Optional: close nav when clicking any nav-link (for extra polish)
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

// If header is loaded dynamically, run after partialLoaded event:
if (document.querySelector('[data-navbar]')) {
  setupMobileNavbar();
} else {
  const hdr = document.getElementById('include-header');
  if (hdr) {
    hdr.addEventListener('partialLoaded', setupMobileNavbar, { once: true });
  }
}


