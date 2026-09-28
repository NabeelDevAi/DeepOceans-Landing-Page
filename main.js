(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  $('#year').textContent = new Date().getFullYear();

  // Navbar: solid after scroll
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // Mobile drawer
  const burger = $('#burger'), drawer = $('#drawer');
  const setMenu = open => {
    drawer.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Active nav link
  const links = $$('.nav-links a:not(.nav-cta)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('#about, #services, #affiliations').forEach(s => spy.observe(s));

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  // Hero slider
  const track = $('#slides'), slides = $$('.slide', track), ticksEl = $('#ticks'), counter = $('#counter'), hero = $('#home');
  const DUR = 6000;
  let cur = 0, timer = null, held = false;

  const ticks = slides.map((_, i) => {
    const b = document.createElement('button');
    b.className = 'tick';
    b.setAttribute('aria-label', `Slide ${i + 1}`);
    b.addEventListener('click', () => go(i));
    ticksEl.appendChild(b);
    return b;
  });
  ticksEl.style.cssText += `;--dur:${DUR}ms`;

  function render() {
    track.style.transform = `translateX(-${cur * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle('on', i === cur));
    ticks.forEach((t, i) => {
      t.classList.remove('on', 'done');
      if (i < cur) t.classList.add('done');
      if (i === cur) { void t.offsetWidth; t.classList.add('on'); }
      t.setAttribute('aria-current', i === cur);
    });
    counter.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    // Warm the next image so it is ready before it slides in
    const nxt = $('img', slides[(cur + 1) % slides.length]);
    if (nxt) nxt.loading = 'eager';
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || held || document.hidden) return;
    timer = setTimeout(() => go(cur + 1), DUR);
  }
  function go(i) { cur = (i + slides.length) % slides.length; render(); schedule(); }

  $('#next').addEventListener('click', () => go(cur + 1));
  $('#prev').addEventListener('click', () => go(cur - 1));

  // Pause on hover/focus and when the tab or hero is off-screen
  const hold = v => { held = v; hero.classList.toggle('paused', v); if (v) clearTimeout(timer); else render(), schedule(); };
  hero.addEventListener('mouseenter', () => hold(true));
  hero.addEventListener('mouseleave', () => hold(false));
  hero.addEventListener('focusin', () => hold(true));
  hero.addEventListener('focusout', () => hold(false));
  document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(timer) : schedule());
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) { clearTimeout(timer); } else if (!held) { schedule(); } }, { threshold: 0.2 }).observe(hero);

  // Swipe
  let sx = null;
  hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  if (reduce) ticks.forEach(t => t.classList.add('done'));
  render(); schedule();
})();
