const imgs = [...document.querySelectorAll('.g-item img')].map(i => ({ src: i.src, alt: i.alt }));
const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
let idx = 0;
function show(i) {
  idx = (i + imgs.length) % imgs.length;
  lbImg.src = imgs[idx].src; lbImg.alt = imgs[idx].alt;
  lb.classList.add('open'); document.body.style.overflow = 'hidden';
}
function hide() { lb.classList.remove('open'); document.body.style.overflow = ''; }
document.querySelectorAll('.g-item').forEach((el, i) => el.addEventListener('click', () => show(i)));
document.getElementById('lbClose').onclick = hide;
document.getElementById('lbPrev').onclick = () => show(idx - 1);
document.getElementById('lbNext').onclick = () => show(idx + 1);
lb.addEventListener('click', e => { if (e.target === lb) hide(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') hide();
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});
