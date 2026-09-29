/* Text and placeholders are sourced verbatim from source.txt.
   Add real URLs here only when supplied by the event organizer. */
const eventLinks = { registration: null, question: null };
window.lucide?.createIcons();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches) document.documentElement.classList.add('js-motion');
const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
document.querySelectorAll('[data-external]').forEach(button => {
  const url = eventLinks[button.dataset.external];
  if (!url) return;
  button.disabled = false;
  button.addEventListener('click', () => window.location.assign(url));
});

// Native details remain keyboard accessible, with a measured opening animation.
document.querySelectorAll('details').forEach(details => {
  const summary = details.querySelector('summary');
  let animation;
  summary.addEventListener('click', event => {
    if (reduceMotion.matches) return;
    event.preventDefault();
    if (animation) { animation.cancel(); animation = null; }
    const startHeight = details.getBoundingClientRect().height;
    const opening = !details.open;
    if (opening) details.open = true;
    const endHeight = opening ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    details.style.overflow = 'hidden';
    animation = details.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: 420, easing: 'cubic-bezier(.2,.75,.2,1)' });
    animation.onfinish = () => {
      details.open = opening;
      details.style.overflow = '';
      animation = null;
    };
  });
});

// A soft pointer response makes the hero sculpture feel spatial without moving text.
const art = document.querySelector('.hero-art');
const hero = document.querySelector('.hero');
if (matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    art.style.transform = `translate3d(${x * 18}px,${y * 14}px,0) rotate(${-15 + x * 5}deg)`;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { art.style.transform = ''; });
}

// Native sticky positioning maps ordinary vertical page travel to horizontal
// movement. No wheel interception, carousel controls, or synthetic scrolling.
const programScroll = document.querySelector('.program-scroll');
const programPin = document.querySelector('.program-pin');
const topics = document.querySelector('.topics');
let horizontalDistance = 0, scrollDistance = 0, pinTop = 0;
let activeProgram = false, programFrame = 0, holdDistance = 72;
function updateProgram() {
  programFrame = 0;
  if (reduceMotion.matches || !programScroll.classList.contains('scroll-ready')) return;
  const travelled = pinTop - programScroll.getBoundingClientRect().top - holdDistance;
  const progress = Math.max(0, Math.min(1, travelled / scrollDistance));
  topics.style.transform = `translate3d(${-horizontalDistance * progress}px,0,0)`;
  if (activeProgram && !document.hidden) programFrame = requestAnimationFrame(updateProgram);
}
function startProgram() {
  if (!programFrame && !reduceMotion.matches) programFrame = requestAnimationFrame(updateProgram);
}
function measureProgram() {
  cancelAnimationFrame(programFrame);
  programFrame = 0;
  if (reduceMotion.matches) {
    programScroll.classList.remove('scroll-ready');
    programScroll.style.height = '';
    topics.style.transform = '';
    return;
  }
  programScroll.classList.add('scroll-ready');
  // The rail clips at the browser edges; finish with the last card aligned
  // to the content gutter, rather than counting the full-bleed viewport padding.
  horizontalDistance = Math.max(0, topics.scrollWidth - programPin.clientWidth);
  scrollDistance = Math.max(horizontalDistance, innerHeight * .8);
  pinTop = parseFloat(getComputedStyle(programPin).top) || 0;
  programScroll.style.height = `${programPin.offsetHeight + scrollDistance + holdDistance * 2}px`;
  startProgram();
}
new ResizeObserver(measureProgram).observe(programPin);
new IntersectionObserver(entries => {
  activeProgram = entries[0].isIntersecting;
  if (activeProgram) startProgram();
  else { cancelAnimationFrame(programFrame); programFrame = 0; }
}, { rootMargin: '150px' }).observe(programScroll);
reduceMotion.addEventListener('change', measureProgram);
document.fonts.ready.then(measureProgram);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(programFrame); programFrame = 0; }
  else if (activeProgram) startProgram();
});
measureProgram();

// Keep every collapsed speaker card equal even when typography wraps differently.
const speakerGrid = document.querySelector('.speaker-grid');
const speakerTopics = [...document.querySelectorAll('.speaker-topic')];
let speakerWidth = 0;
function alignSpeakerTopics(force = false) {
  const width = speakerGrid.clientWidth;
  if (!force && width === speakerWidth) return;
  speakerWidth = width;
  speakerTopics.forEach(topic => { topic.style.minHeight = '0'; });
  const height = Math.max(106, ...speakerTopics.map(topic => topic.getBoundingClientRect().height));
  speakerTopics.forEach(topic => { topic.style.minHeight = `${height}px`; });
}
new ResizeObserver(() => alignSpeakerTopics()).observe(speakerGrid);
document.fonts.ready.then(() => alignSpeakerTopics(true));
