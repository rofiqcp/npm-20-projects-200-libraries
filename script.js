// ============================================
// RofiqCP - IoT Solutions - Main Script
// ============================================

// ---- Navbar Scroll Effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile Menu Toggle ----
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observerNav.observe(s));

// ---- Particles ----
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

// ---- IoT Network Connection Lines ----
function drawConnections() {
  const svg = document.getElementById('connLines');
  if (!svg) return;
  const hub = document.querySelector('.hub-center');
  const nodes = document.querySelectorAll('.iot-node');
  if (!hub) return;

  // Add gradient def
  svg.innerHTML = `
    <defs>
      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:0.6"/>
      </linearGradient>
    </defs>
  `;

  const networkEl = document.getElementById('iotNetwork');
  const networkRect = networkEl.getBoundingClientRect();
  const hubRect = hub.getBoundingClientRect();
  const hx = hubRect.left - networkRect.left + hubRect.width / 2;
  const hy = hubRect.top - networkRect.top + hubRect.height / 2;

  nodes.forEach(node => {
    const nodeIcon = node.querySelector('.node-icon');
    const rect = nodeIcon.getBoundingClientRect();
    const nx = rect.left - networkRect.left + rect.width / 2;
    const ny = rect.top - networkRect.top + rect.height / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', hx); line.setAttribute('y1', hy);
    line.setAttribute('x2', nx); line.setAttribute('y2', ny);
    line.setAttribute('class', 'conn-line');
    const delay = Math.random() * 3;
    line.style.animationDelay = `${delay}s`;
    svg.appendChild(line);
  });
}
setTimeout(drawConnections, 300);
window.addEventListener('resize', () => setTimeout(drawConnections, 300));

// ---- AOS (Animate on Scroll) ----
const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute('data-aos-delay') || 0;
      setTimeout(() => {
        entry.target.classList.add('aos-animate');
      }, parseInt(delay));
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

// ---- Counter Animation ----
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ---- Contact Form ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span>Mengirim...</span>`;
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = `<span>✓ Pesan Terkirim!</span>`;
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    }, 1500);
  });
}

// ---- Smooth scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      navLinks.classList.remove('open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
