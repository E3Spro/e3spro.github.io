/* ══════════════════════════════════════════════════════════
   E3Spro — main.js
══════════════════════════════════════════════════════════ */

/* ── Navigation scroll effect ────────────────────────────── */
const navHeader = document.getElementById('nav-header');

window.addEventListener('scroll', () => {
  navHeader.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveLink();
}, { passive: true });

/* ── Active nav link on scroll ───────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + height);
  });
}

/* ── Mobile burger menu ──────────────────────────────────── */
const burger   = document.getElementById('nav-burger');
const navList  = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const open = !navList.classList.contains('open');
  navList.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navList.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navList.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Hero spark particles ────────────────────────────────── */
function createSparks() {
  const container = document.getElementById('hero-sparks');
  if (!container) return;
  const count = window.innerWidth < 768 ? 18 : 36;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${20 + Math.random() * 70}%;
      --dur:   ${4 + Math.random() * 6}s;
      --delay: ${Math.random() * 6}s;
      width:  ${Math.random() > .7 ? 4 : 2}px;
      height: ${Math.random() > .7 ? 4 : 2}px;
    `;
    container.appendChild(spark);
  }
}
createSparks();

/* ── Counter animation ───────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('fr-FR');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('fr-FR');
  }
  requestAnimationFrame(step);
}

/* ── Intersection Observer — fade-up + counters ─────────── */
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;
    setTimeout(() => el.classList.add('visible'), delay);
    fadeObs.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.service-card, .atout-item, .about-grid, .contact-grid')
  .forEach(el => { el.classList.add('fade-up'); fadeObs.observe(el); });

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-trust');
if (statsEl) counterObs.observe(statsEl);

/* ── Form validation & submit ────────────────────────────── */
const form        = document.getElementById('contact-form');
const submitBtn   = document.getElementById('form-submit');
const formSuccess = document.getElementById('form-success');

/* Affiche le succès si on revient avec ?sent=1 */
if (formSuccess && window.location.search.includes('sent=1')) {
  form && form.querySelectorAll('.form-row, .form-group, .btn, .form-legal').forEach(el => el.style.display = 'none');
  formSuccess.classList.add('visible');
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}

if (form) {
  const rules = {
    nom:       { required: true, minLength: 2, label: 'Le nom' },
    telephone: { required: true, pattern: /^[\d\s\+\-\(\)\.]{8,}$/, label: 'Le téléphone' },
    email:     { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "L'email" },
    message:   { required: true, minLength: 10, label: 'Le message' },
  };

  function validate(name, value) {
    const rule = rules[name];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} est requis.`;
    if (rule.minLength && value.trim().length < rule.minLength) return `${rule.label} est trop court.`;
    if (rule.pattern && !rule.pattern.test(value.trim())) return `${rule.label} n'est pas valide.`;
    return '';
  }

  function setError(name, msg) {
    const input = form.querySelector(`[name="${name}"]`);
    const err   = document.getElementById(`${name}-error`);
    if (!input || !err) return;
    input.classList.toggle('error', !!msg);
    err.textContent = msg;
  }

  Object.keys(rules).forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    input.addEventListener('blur',  () => setError(name, validate(name, input.value)));
    input.addEventListener('input', () => { if (input.classList.contains('error')) setError(name, validate(name, input.value)); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(rules).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      const msg   = validate(name, input ? input.value : '');
      setError(name, msg);
      if (msg) valid = false;
    });
    if (!valid) return;

    /* Définit l'URL de retour dynamiquement pour afficher le succès */
    const nextField = document.getElementById('form-next');
    if (nextField) {
      nextField.value = window.location.href.split('?')[0] + '?sent=1#contact';
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Envoi en cours…';

    form.submit();
  });
}

/* ── Carte IDF interactive ───────────────────────────────── */
const idfMap     = document.getElementById('idf-map');
const depTooltip = document.getElementById('dep-tooltip');
const depItems   = document.querySelectorAll('.dep-list-item');

if (idfMap && depTooltip) {

  /* Animation de tracé au scroll */
  const mapObs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    idfMap.querySelectorAll('.dep-path').forEach((path, i) => {
      const len = Math.ceil(path.getTotalLength());
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
      setTimeout(() => {
        path.style.transition      = `stroke-dashoffset .9s cubic-bezier(.4,0,.2,1), fill .7s ease .7s`;
        path.style.strokeDashoffset = 0;
      }, i * 110);
    });
    mapObs.disconnect();
  }, { threshold: .25 });
  mapObs.observe(idfMap);

  /* Hover sur les départements SVG */
  function activateDep(depEl) {
    idfMap.querySelectorAll('.dep').forEach(d => d.classList.remove('active'));
    depItems.forEach(li => li.classList.remove('active'));
    if (!depEl) return;
    depEl.classList.add('active');
    const li = document.querySelector(`.dep-list-item[data-target="${depEl.id}"]`);
    if (li) li.classList.add('active');
  }

  idfMap.querySelectorAll('.dep').forEach(dep => {
    dep.addEventListener('mouseenter', () => {
      depTooltip.querySelector('.dep-tooltip__num').textContent  = dep.dataset.num;
      depTooltip.querySelector('.dep-tooltip__name').textContent = dep.dataset.name;
      depTooltip.querySelector('.dep-tooltip__cities').textContent = dep.dataset.cities;
      depTooltip.classList.add('visible');
      activateDep(dep);
    });

    dep.addEventListener('mousemove', (e) => {
      const rect = idfMap.parentElement.getBoundingClientRect();
      const x = e.clientX - rect.left + 16;
      const y = e.clientY - rect.top  - depTooltip.offsetHeight / 2;
      const maxX = rect.width - depTooltip.offsetWidth - 8;
      depTooltip.style.left = `${Math.min(x, maxX)}px`;
      depTooltip.style.top  = `${Math.max(y, 8)}px`;
    });

    dep.addEventListener('mouseleave', () => {
      depTooltip.classList.remove('visible');
      activateDep(null);
    });
  });

  /* Hover sur la liste → highlight carte */
  depItems.forEach(li => {
    li.addEventListener('mouseenter', () => {
      const dep = document.getElementById(li.dataset.target);
      activateDep(dep);
    });
    li.addEventListener('mouseleave', () => activateDep(null));
  });
}

/* ── Smooth scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav')) || 72);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
