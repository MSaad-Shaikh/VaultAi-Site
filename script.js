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

// ── Pricing Workspace Rates ──
const pricingData = {
  basic: {
    monthly: { price: '₹2,699', original: '₹4,499', discount: 'Launch Special' }
  },
  custom: {
    monthly: { price: '₹3,999', original: '₹5,999', discount: 'Recommended' }
  }
};

// ── Live Urgency Countdown Timer (ticking) ──
(function initUrgencyCountdown() {
  // 11 hours, 56 mins, 7 seconds total in seconds
  let totalSeconds = 11 * 3600 + 56 * 60 + 7;

  function pad(num) {
    return num.toString().padStart(2, '0');
  }

  function tick() {
    if (totalSeconds <= 0) {
      totalSeconds = 24 * 3600; // reset
    } else {
      totalSeconds--;
    }

    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    document.querySelectorAll('.countdown-days').forEach(el => el.textContent = pad(days));
    document.querySelectorAll('.countdown-hrs').forEach(el => el.textContent = pad(hrs));
    document.querySelectorAll('.countdown-mins').forEach(el => el.textContent = pad(mins));
    document.querySelectorAll('.countdown-secs').forEach(el => el.textContent = pad(secs));
  }

  setInterval(tick, 1000);
  tick();
})();

