// ── Initialize Lucide Icons if available ──
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// ── FAQ accordion ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // open clicked if was closed
    if (!isOpen) item.classList.add('open');
  });
});

// ── Notification helper ──
function showNotif(msg, duration = 3000) {
  const notif = document.getElementById('notif');
  const text = document.getElementById('notif-text');
  if (!notif || !text) return;
  text.textContent = msg;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), duration);
}

// expose globally
window.showNotif = showNotif;


// Launch offer countdown through November 30, 2026 (India Standard Time).
const countdownEls = document.querySelectorAll('.countdown-days');
if (countdownEls.length) {
  const offerDeadline = new Date('2026-11-30T23:59:59+05:30').getTime();
  const padTime = value => String(value).padStart(2, '0');
  function updateOfferCountdown() {
    const remaining = Math.max(0, Math.floor((offerDeadline - Date.now()) / 1000));
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    document.querySelectorAll('.countdown-days').forEach(el => el.textContent = padTime(days));
    document.querySelectorAll('.countdown-hrs').forEach(el => el.textContent = padTime(hours));
    document.querySelectorAll('.countdown-mins').forEach(el => el.textContent = padTime(minutes));
    document.querySelectorAll('.countdown-secs').forEach(el => el.textContent = padTime(seconds));
  }
  updateOfferCountdown();
  window.setInterval(updateOfferCountdown, 1000);
}