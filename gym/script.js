const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches; // used for hover-to-open panels

// ---------- loader (counts to 100) ----------
(function () {
  const n = $('#loadNum'), t0 = performance.now(), dur = 1500;
  (function tick(t) {
    const p = clamp((t - t0) / dur);
    n.textContent = Math.round(p * 100);
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(() => $('#loader').classList.add('done'), 250);
  })(t0);
})();

// ---------- hero title: split into letters ----------
$$('.hl').forEach((el, li) => {
  el.innerHTML = [...el.dataset.t].map((c, i) =>
    `<span class="ch" style="animation-delay:${1.9 + li * .18 + i * .045}s">${c}</span>`).join('');
});

// ---------- hero slideshow ----------
const sbg = $$('.sbg'), hdots = $$('#heroDots button');
let hs = 0, hTimer;
function heroGo(i) {
  hs = i;
  sbg.forEach((s, k) => s.classList.toggle('active', k === i));
  hdots.forEach((d, k) => { d.classList.remove('active'); if (k === i) { void d.offsetWidth; d.classList.add('active'); } });
}
function heroAuto() { clearInterval(hTimer); hTimer = setInterval(() => heroGo((hs + 1) % sbg.length), 5000); }
hdots.forEach((d, i) => d.onclick = () => { heroGo(i); heroAuto(); });
heroAuto();

// ---------- typed rotating word ----------
const words = ['STRONGER', 'FASTER', 'LEANER', 'FEARLESS', 'UNSTOPPABLE'];
let wi = 0, ci = words[0].length, del = true;
const rot = $('#rot');
(function type() {
  rot.textContent = words[wi].slice(0, ci);
  if (del) { ci--; if (ci < 0) { del = false; wi = (wi + 1) % words.length; ci = 0; } }
  else { ci++; if (ci > words[wi].length) { del = true; ci = words[wi].length; return setTimeout(type, 1400); } }
  setTimeout(type, del ? 45 : 90);
})();

// ---------- embers (light: no blur, pauses offscreen) ----------
(function () {
  const cv = $('#embers'), cx = cv.getContext('2d'), hero = $('#home');
  let W, H, run = true; const ps = [];
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize(); addEventListener('resize', resize);
  const mk = rand => ({ x: Math.random() * W, y: rand ? Math.random() * H : H + 10, r: Math.random() * 2 + .8, v: Math.random() * 1 + .4,
    dx: (Math.random() - .5) * .5, c: Math.random() < .7 ? '198,255,0' : '255,90,20', a: Math.random() * .6 + .3 });
  for (let i = 0; i < 28; i++) ps.push(mk(true));
  new IntersectionObserver(e => { run = e[0].isIntersecting; if (run) frame(); }).observe(hero);
  function frame() {
    if (!run) return;
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.y -= p.v; p.x += p.dx; p.a -= .0015;
      cx.fillStyle = `rgba(${p.c},${Math.max(p.a, 0)})`;
      cx.fillRect(p.x, p.y, p.r * 2, p.r * 2);
      if (p.y < -10 || p.a <= 0) ps[i] = mk(false);
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ---------- scroll (one rAF-throttled handler, cached sizes) ----------
const nav = $('#nav'), totop = $('#totop'), prog = $('#progress'), marq = $('.marq');
let lastY = scrollY, skew = 0, ticking = false, maxScroll = 1;
const calc = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };
addEventListener('load', calc); addEventListener('resize', calc);
let navS = false, topS = false;
function onScroll() {
  const y = scrollY;
  prog.style.transform = `scaleX(${y / maxScroll})`;
  const n = y > 40, t = y > 700;
  if (n !== navS) { navS = n; nav.classList.toggle('scrolled', n); }
  if (t !== topS) { topS = t; totop.classList.toggle('show', t); }
  skew += (clamp((y - lastY) * .12, -4, 4) - skew) * .5; lastY = y;
  marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : '';
  statement(); hscroll();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
setInterval(() => { if (Math.abs(skew) > .05) { skew *= .6; marq.style.transform = Math.abs(skew) > .05 ? `skewY(${skew.toFixed(2)}deg)` : ''; } }, 80);
totop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// mobile menu
const burger = $('#burger'), menu = $('#menu');
burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
$$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

// ---------- pinned statement: words light up on scroll ----------
const wEl = $('#words'), hot = /^(strong|people|every|build|counts)/i;
wEl.innerHTML = wEl.textContent.split(' ').map(w => `<span class="w${hot.test(w) ? ' hot' : ''}">${w}</span>`).join(' ');
const wSpans = $$('.w', wEl), sec = $('#statement');
let lastN = -1;
function statement() {
  const r = sec.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const n = Math.round(clamp(-r.top / (r.height - innerHeight)) * 1.15 * wSpans.length);
  if (n === lastN) return; lastN = n;
  wSpans.forEach((s, i) => s.classList.toggle('on', i < n));
}

// ---------- programs accordion ----------
const panels = $$('.panel');
panels.forEach(p => {
  const open = () => { panels.forEach(x => x.classList.remove('active')); p.classList.add('active'); };
  p.addEventListener('click', open);
  if (fine) p.addEventListener('mouseenter', open);
});

// ---------- horizontal scroll gallery ----------
const hs0 = $('#gallery'), htrack = $('#htrack'), hstick = $('.hstick'), htitle = $('.htitle');
let trackW = 0, pageTop = 0;
function hsize() {
  trackW = htrack.scrollWidth - innerWidth;
  hs0.style.height = (trackW + innerHeight) + 'px';
  pageTop = hs0.offsetTop; calc();
}
addEventListener('resize', hsize); addEventListener('load', hsize); hsize();
let lastP = -1;
function hscroll() {
  const h = hs0.offsetHeight - innerHeight, p = clamp((scrollY - hs0.offsetTop) / h);
  if (p === lastP) return; lastP = p;
  htrack.style.transform = `translate3d(${-p * trackW}px,0,0)`;
  hstick.style.setProperty('--p', p);
  htitle.style.opacity = 1 - clamp(p * 5);
}

// ---------- reveal / counters / magnetic ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 2000;
  const tick = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick); cio.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

$$('.magnetic').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});

// ripple on click
addEventListener('click', e => {
  const r = document.createElement('span'); r.className = 'ripple';
  r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
  document.body.appendChild(r); setTimeout(() => r.remove(), 700);
});

// ---------- schedule ----------
const data = {
  mon: [['06:00', 'Power Lifting', 'Marcus Reed', 'Strength'], ['08:00', 'Morning Flow', 'Aiko Lin', 'Yoga'], ['18:00', 'Functional Fitness', 'Dana Cole', 'Functional'], ['19:30', 'Metcon Madness', 'Sara Khan', 'HIIT']],
  tue: [['06:30', 'HIIT Blast', 'Sara Khan', 'HIIT'], ['12:00', 'Lunch Express Circuit', 'Sara Khan', 'HIIT'], ['18:00', 'Squat Clinic', 'Marcus Reed', 'Strength'], ['20:00', 'Mobility Reset', 'Aiko Lin', 'Yoga']],
  wed: [['06:00', 'Battle Ropes', 'Dana Cole', 'HIIT'], ['09:00', 'Core & Abs', 'Sara Khan', 'HIIT'], ['17:30', 'Deadlift Day', 'Marcus Reed', 'Strength'], ['19:00', 'Vinyasa', 'Aiko Lin', 'Yoga']],
  thu: [['06:30', 'Strength Foundations', 'Marcus Reed', 'Strength'], ['12:00', 'Cardio Burn', 'Sara Khan', 'Cardio'], ['18:00', 'Athlete Circuit', 'Dana Cole', 'Functional'], ['20:00', 'Yin Yoga', 'Aiko Lin', 'Yoga']],
  fri: [['06:00', 'Upper Body Power', 'Marcus Reed', 'Strength'], ['08:00', 'HIIT Friday', 'Sara Khan', 'HIIT'], ['17:00', 'Sled & Rope Cardio', 'Dana Cole', 'Cardio'], ['19:00', 'Stretch & Chill', 'Aiko Lin', 'Yoga']],
  sat: [['08:00', 'Team WOD', 'Sara Khan', 'HIIT'], ['10:00', 'Olympic Lifting', 'Marcus Reed', 'Strength'], ['12:00', 'Open Gym', 'All coaches', 'Open']],
  sun: [['09:00', 'Sunday Yoga', 'Aiko Lin', 'Yoga'], ['11:00', 'Recovery Ride', 'Sara Khan', 'Cardio'], ['16:00', 'Open Gym', 'All coaches', 'Open']]
};
const sched = $('#sched');
function renderDay(d) {
  sched.innerHTML = data[d].map((r, i) =>
    `<div class="row" style="animation-delay:${i * .09}s"><time>${r[0]}</time><div><h4>${r[1]}</h4><span>with ${r[2]}</span></div><em>${r[3]}</em></div>`).join('');
}
renderDay('mon');
$$('#tabs button').forEach(b => b.onclick = () => {
  $$('#tabs button').forEach(x => x.classList.remove('active')); b.classList.add('active'); renderDay(b.dataset.day);
});

// ---------- pricing toggle ----------
const sw = $('#billing');
sw.onclick = () => {
  sw.classList.toggle('on');
  const y = sw.classList.contains('on');
  $$('.amt b').forEach(b => {
    const from = +b.textContent, to = +b.dataset[y ? 'y' : 'm'], t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 500, 1); b.textContent = Math.round(from + (to - from) * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
};

// ---------- testimonials ----------
const slides = $$('.slide'), dots = $$('#dots button');
let cur = 0, timer;
function show(i) {
  cur = i;
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
}
function auto() { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5000); }
dots.forEach((d, i) => d.onclick = () => { show(i); auto(); });
auto();

// ---------- BMI ----------
$('#bmiForm').addEventListener('submit', e => {
  e.preventDefault();
  const w = +$('#w').value, h = +$('#h').value / 100, bmi = w / (h * h);
  const label = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';
  $('#needle').style.left = clamp((bmi - 15) / 25, .01, .98) * 100 + '%';
  $('#bmiText').textContent = `Your BMI is ${bmi.toFixed(1)} — ${label}. Let's build a plan!`;
});

// ---------- contact form ----------
$('#form').addEventListener('submit', e => { e.preventDefault(); $('#ok').classList.add('show'); e.target.reset(); });

onScroll();
