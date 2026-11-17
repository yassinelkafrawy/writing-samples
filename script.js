'use strict';

const home = document.querySelector('#home');
const readers = Array.from(document.querySelectorAll('[data-reader]'));
const progress = document.querySelector('.reading-progress span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeReader = null;
let scrollFrame = 0;
let printTarget = null;

document.documentElement.classList.add('has-script');

function updateProgress() {
  scrollFrame = 0;
  if (!activeReader) return;

  const rect = activeReader.getBoundingClientRect();
  const end = Math.max(rect.height - window.innerHeight, 1);
  const fraction = Math.min(1, Math.max(0, -rect.top / end));
  progress.style.transform = `scaleX(${fraction})`;
}

function queueProgress() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateProgress);
}

function renderRoute() {
  const target = document.getElementById(window.location.hash.slice(1));
  activeReader = target?.closest('[data-reader]') ?? null;
  home.hidden = Boolean(activeReader);
  readers.forEach(reader => { reader.hidden = reader !== activeReader; });
  document.body.classList.toggle('reader-open', Boolean(activeReader));

  if (target) {
    window.requestAnimationFrame(() => {
      if (!target.matches('a, button, [tabindex]')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'auto' });
      queueProgress();
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  queueProgress();
}

function preparePrint(reader) {
  printTarget?.classList.remove('print-target');
  printTarget = reader;
  printTarget?.classList.add('print-target');
  document.body.classList.toggle('printing', Boolean(printTarget));
}

document.querySelectorAll('[data-print]').forEach(button => {
  button.addEventListener('click', () => {
    const reader = readers.find(item => item.dataset.reader === button.dataset.print);
    preparePrint(reader);
    window.print();
  });
});

window.addEventListener('beforeprint', () => {
  if (!printTarget) preparePrint(activeReader);
});
window.addEventListener('afterprint', () => preparePrint(null));
window.addEventListener('hashchange', renderRoute);
window.addEventListener('scroll', queueProgress, { passive: true });
window.addEventListener('resize', queueProgress);
renderRoute();
