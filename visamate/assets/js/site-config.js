// assets/js/site-config.js

'use strict';

async function loadConfig() {
  const res = await fetch('./assets/js/config.json');
  return res.ok ? res.json() : {};
}

loadConfig().then(cfg => {
  // Helper to clean phone/WhatsApp numbers
  const cleanNumber = num => (num || '').replace(/[^+\d]/g, '').replace('+', '');

  // WhatsApp
  const wa = document.getElementById("whatsapp-link");
  if (wa && cfg.whatsapp) wa.href = `https://wa.me/${cleanNumber(cfg.whatsapp)}`;

  // Phone (dock)
  const phoneLink = document.getElementById("phone-link");
  const phoneNumber = document.getElementById("phone-number");
  if (phoneLink && cfg.phone) phoneLink.href = `tel:${cleanNumber(cfg.phone)}`;
  if (phoneNumber && cfg.phone) phoneNumber.textContent = cfg.phone;

  // Header helpline
  const helpline = document.getElementById("helpline-number");
  if (helpline && cfg.phone) helpline.textContent = cfg.phone;

  // Footer contact
  const footerPhone = document.getElementById("footer-phone");
  const footerEmail = document.getElementById("footer-email");
  const footerAddress = document.getElementById("footer-address"); // Optional
  if (footerPhone && cfg.phone) {
    footerPhone.href = `tel:${cleanNumber(cfg.phone)}`;
    footerPhone.textContent = cfg.phone;
  }
  if (footerEmail && cfg.email) {
    footerEmail.href = `mailto:${cfg.email}`;
    footerEmail.textContent = cfg.email;
  }
  if (footerAddress && cfg.address) footerAddress.textContent = cfg.address;

  // Social links
  const fb = document.getElementById("social-facebook");
  const ig = document.getElementById("social-instagram");
  const yt = document.getElementById("social-youtube");
  if (fb && cfg.social?.facebook) fb.href = cfg.social.facebook;
  if (ig && cfg.social?.instagram) ig.href = cfg.social.instagram;
  if (yt && cfg.social?.youtube) yt.href = cfg.social.youtube;

  // About (optional footer or anywhere else)
  const about = document.getElementById("footer-about");
  if (about && cfg.about) about.textContent = cfg.about;
});
