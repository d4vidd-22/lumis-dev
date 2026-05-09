const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const cur = document.getElementById('cur');
if (cur && finePointer) {
  document.body.classList.add('has-custom-cursor');

  document.addEventListener('mousemove', e => {
    cur.style.left = `${e.clientX}px`;
    cur.style.top = `${e.clientY}px`;
  });

  document.querySelectorAll('a,button,input,select').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
}

const board = document.getElementById('tri-board');
const scene = document.getElementById('tri-scene');

if (board && scene && !reduceMotion) {
  const MAX = 10;
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    tRY = nx * MAX;
    tRX = -ny * MAX;
  });

  (function animTri() {
    cRX += (tRX - cRX) * 0.055;
    cRY += (tRY - cRY) * 0.055;
    board.style.transform = `rotateX(${cRX.toFixed(3)}deg) rotateY(${cRY.toFixed(3)}deg)`;
    requestAnimationFrame(animTri);
  })();

  window.addEventListener('scroll', () => {
    scene.style.transform = `translateY(calc(-50% + ${window.scrollY * 0.13}px))`;
  }, { passive: true });
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';

function scramble(el) {
  const orig = el.dataset.text || el.textContent.trim();
  if (el._sc || reduceMotion) return;
  el._sc = true;
  let i = 0, total = orig.length * 3;
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((ch, idx) => {
      if (ch === ' ') return ' ';
      if (idx < Math.floor(i / 3)) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    if (++i > total) {
      el.textContent = orig;
      el._sc = false;
      clearInterval(iv);
    }
  }, 30);
}

document.querySelectorAll('.mx').forEach(el => {
  if (!el.dataset.text) el.dataset.text = el.textContent.trim();
  el.addEventListener('mouseenter', () => scramble(el));
});

const revealItems = document.querySelectorAll('.rv,.rl');
if ('IntersectionObserver' in window && !reduceMotion) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach(el => obs.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('on'));
}

const pricing = {
  basic: {
    brl: 'R$ 397',
    usd: 'US$ 79'
  },
  intermediate: {
    brl: 'R$ 997',
    usd: 'US$ 199'
  },
  advanced: {
    brl: 'R$ 1.997',
    usd: 'US$ 399'
  }
};

const renewals = {
  basic: { brl: 'R$ 149/ano', usd: 'US$ 29/ano' },
  intermediate: { brl: 'R$ 349/ano', usd: 'US$ 69/ano' },
  advanced: { brl: 'R$ 699/ano', usd: 'US$ 139/ano' }
};

const pricingState = { currency: 'brl' };

function updateSegmentButtons(type, value) {
  document.querySelectorAll(`[data-${type}]`).forEach(btn => {
    const isActive = btn.dataset[type] === value;
    btn.classList.toggle('on', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function updatePrices() {
  document.querySelectorAll('[data-plan]').forEach(card => {
    const plan = card.dataset.plan;
    const value = pricing[plan]?.[pricingState.currency];
    const priceEl = card.querySelector('[data-price-value]');

    if (priceEl && value) priceEl.textContent = value;
  });

  document.querySelectorAll('[data-renewal]').forEach(el => {
    const plan = el.dataset.renewal;
    const value = renewals[plan]?.[pricingState.currency];
    if (value) el.textContent = value;
  });
}

document.querySelectorAll('[data-currency]').forEach(btn => {
  btn.addEventListener('click', () => {
    pricingState.currency = btn.dataset.currency;
    updateSegmentButtons('currency', pricingState.currency);
    updatePrices();
  });
});

updatePrices();
