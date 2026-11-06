/* ==========================================================
   Marcos Andaya — Portfolio
   ▶ EDIT YOUR EMAIL HERE (one place — updates every link):
   ========================================================== */
const EMAIL = 'mandaya35@gmail.com';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- email wiring ---------- */
$$('[data-mailto]').forEach(a => {
  a.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Virtual Assistant Opportunity')}`;
});
$$('[data-email-text]').forEach(el => { el.textContent = EMAIL; });
const copyBtn = $('#copyEmail');
const copyStatus = $('#copyStatus');
copyBtn?.addEventListener('click', async () => {
  const label = copyBtn.firstChild;
  try {
    await navigator.clipboard.writeText(EMAIL);
    copyStatus.textContent = 'Email address copied to clipboard';
    label.textContent = 'Copied ';
  } catch {
    copyStatus.textContent = 'Copy failed — please select the email text manually';
    label.textContent = 'Press Ctrl+C ';
  }
  setTimeout(() => { label.textContent = 'Copy email '; }, 2200);
});

/* ---------- mobile menu ---------- */
const header = $('.site-header');
const menuButton = $('.menu-toggle');
const nav = $('.nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuButton.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* ---------- scroll: progress bar, header, back-to-top ---------- */
const bar = $('.progress i');
const fab = $('.fab');
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  header.classList.toggle('scrolled', y > 40);
  fab.classList.toggle('show', y > 700);
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ---------- active nav link ---------- */
const navLinks = $$('.nav a[href^="#"]:not(.nav-cta)');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['about', 'skills', 'work', 'reviews', 'credentials'].forEach(id => { const s = document.getElementById(id); if (s) sectionObserver.observe(s); });

/* ---------- reveal on scroll (with stagger inside grids) ---------- */
$$('.skill-grid, .project-grid, .cred-grid, .principles, .quote-grid').forEach(group => {
  $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 0.09}s`));
});
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- typewriter ---------- */
const typed = $('#typed');
if (typed && !reduceMotion) {
  const words = JSON.parse(typed.dataset.words);
  let w = 0, c = words[0].length, deleting = true;
  (function tick() {
    const word = words[w];
    if (!deleting && c < word.length) c++;
    else if (deleting && c > 0) c--;
    typed.textContent = word.slice(0, c);
    let delay = deleting ? 32 : 70;
    if (!deleting && c === word.length) { delay = 1700; deleting = true; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
    setTimeout(tick, delay);
  })();
}

/* ---------- count-up stats ---------- */
const counters = $$('[data-count]');
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, end = +el.dataset.count;
    countObserver.unobserve(el);
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1300;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
}, { threshold: 0.6 });
counters.forEach(c => countObserver.observe(c));

/* ---------- photo tilt (desktop pointer only) ---------- */
const tilt = $('[data-tilt]');
if (tilt && !reduceMotion && window.matchMedia('(hover: hover) and (min-width: 1001px)').matches) {
  tilt.addEventListener('pointermove', e => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  });
  tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
}

/* ---------- pointer glow on skill cards ---------- */
if (!reduceMotion) {
  $$('.skill-card').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));
}

/* ---------- project filter ---------- */
const filters = $$('.filter');
const cards = $$('.project-card');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(f => { f.classList.toggle('active', f === btn); f.setAttribute('aria-pressed', String(f === btn)); });
  const key = btn.dataset.filter;
  cards.forEach(card => {
    const show = key === 'all' || card.dataset.category === key;
    if (show) {
      card.classList.remove('hidden');
      requestAnimationFrame(() => card.classList.remove('is-hiding'));
    } else {
      card.classList.add('is-hiding');
      setTimeout(() => { if (card.classList.contains('is-hiding')) card.classList.add('hidden'); }, reduceMotion ? 0 : 300);
    }
    // keep cards visible even if they were mid-reveal
    card.classList.add('visible');
  });
  // the featured (wide) card only makes sense in "all" / its own category
  $$('.project-feature').forEach(f => { f.style.gridColumn = (key === 'all' || key === 'real-estate') ? '' : 'auto'; });
}));

/* ---------- lightbox with prev/next + focus trap ---------- */
const lightbox = $('.lightbox');
const lbImg = $('img', lightbox), lbTitle = $('h3', lightbox), lbDesc = $('p', lightbox), lbCount = $('small', lightbox);
const lbClose = $('.lb-close', lightbox), lbPrev = $('.lb-prev', lightbox), lbNext = $('.lb-next', lightbox);
let gallery = [], index = 0, lastFocus = null;

function show(i) {
  index = (i + gallery.length) % gallery.length;
  const item = gallery[index].dataset;
  lbImg.src = item.image;
  lbImg.alt = item.title;
  lbTitle.textContent = item.title;
  lbDesc.textContent = item.description || '';
  lbCount.textContent = `${index + 1} / ${gallery.length}`;
  const multi = gallery.length > 1;
  lbPrev.hidden = lbNext.hidden = !multi;
}
function openLightbox(trigger, group) {
  gallery = group.filter(el => !el.classList.contains('hidden'));
  lastFocus = trigger;
  lightbox.hidden = false;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  show(gallery.indexOf(trigger.closest('[data-image]')));
  lbClose.focus();
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.hidden = true;
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lbImg.removeAttribute('src');
  lastFocus?.focus();
}
cards.forEach(card => $('.project-image', card).addEventListener('click', e => openLightbox(e.currentTarget, cards)));
const credCards = $$('.cred-card');
credCards.forEach(card => card.addEventListener('click', e => openLightbox(e.currentTarget, credCards)));
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => show(index - 1));
lbNext.addEventListener('click', () => show(index + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') show(index - 1);
  else if (e.key === 'ArrowRight') show(index + 1);
  else if (e.key === 'Tab') {
    const f = [lbClose, lbPrev, lbNext].filter(b => !b.hidden);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
// swipe on touch devices
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- footer year ---------- */
$('#year').textContent = new Date().getFullYear();
