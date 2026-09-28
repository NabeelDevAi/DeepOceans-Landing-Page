(() => {
  const items = [...document.querySelectorAll('.g-item')];
  const imgs = items.map(b => b.querySelector('img'));
  const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'), count = document.getElementById('lbCount');
  const closeBtn = document.getElementById('lbClose');
  let idx = 0, opener = null;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].currentSrc || imgs[idx].src;
    lbImg.alt = imgs[idx].alt;
    count.textContent = `${idx + 1} / ${imgs.length}`;
    // Preload neighbours for instant next/prev
    [idx - 1, idx + 1].forEach(n => { new Image().src = imgs[(n + imgs.length) % imgs.length].src; });
  }
  function open(i, btn) {
    opener = btn;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  items.forEach((b, i) => b.addEventListener('click', () => open(i, b)));
  closeBtn.onclick = close;
  document.getElementById('lbPrev').onclick = () => show(idx - 1);
  document.getElementById('lbNext').onclick = () => show(idx + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...lb.querySelectorAll('button')].filter(x => x.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });
})();
