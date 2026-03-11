// ─── Dark Mode ───────────────────────────────────────────────────────────────
const html = document.documentElement;

function applyTheme(dark) {
  if (dark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

document.addEventListener('DOMContentLoaded', () => {
  // Init feather icons
  feather.replace();

  // Dark mode toggle
  const darkToggle = document.getElementById('darkToggle');
  darkToggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ─── Mobile Menu ──────────────────────────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // ─── Smooth Scrolling ─────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ─── Active Nav Link on Scroll ────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.dataset.section === id) link.classList.add('active');
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ─── Scroll Reveal (IntersectionObserver) ─────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-left');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));

  // ─── Form Validation ──────────────────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formAlert = document.getElementById('formAlert');

  function showFieldError(input, errorId, show) {
    const errorEl = document.getElementById(errorId);
    if (show) {
      input.classList.add('error');
      errorEl.classList.remove('hidden');
    } else {
      input.classList.remove('error');
      errorEl.classList.add('hidden');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    showFieldError(nameInput, 'nameError', !name);
    if (!name) valid = false;

    showFieldError(emailInput, 'emailError', !email || !isValidEmail(email));
    if (!email || !isValidEmail(email)) valid = false;

    showFieldError(messageInput, 'messageError', !message);
    if (!message) valid = false;

    if (valid) {
      formAlert.innerHTML = '<div class="alert-success flex items-center gap-2"><span>✓</span> Message sent successfully! I\'ll get back to you soon.</div>';
      form.reset();
      setTimeout(() => { formAlert.innerHTML = ''; }, 5000);
    } else {
      formAlert.innerHTML = '<div class="alert-error">Please fix the errors above and try again.</div>';
    }
  });

  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      formAlert.innerHTML = '';
    });
  });

  // ─── Navbar shadow on scroll ──────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-md');
    } else {
      navbar.classList.remove('shadow-md');
    }
  }, { passive: true });
});
