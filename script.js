// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after tapping a link
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Simple scroll-reveal for sections
const revealTargets = document.querySelectorAll(
  '.problem, .approach h2, .approach .eyebrow, .core-entry, .pipeline, .why-copy, .why-art, .contact h2, .contact .lede, .contact .btn'
);

revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((el) => observer.observe(el));

// ---------------------------------------------------------------
// Layer-by-layer uncertainty pipeline
//
// Recreates the "Solution" slide animation from the investor deck:
// each geoscience data layer narrows the uncertainty band, down to
// a drill target, the holes that test it, and the logged core that
// confirms it — then points at the next target.
// ---------------------------------------------------------------
(function () {
  const pipeline = document.getElementById('pipeline');
  if (!pipeline) return;

  const stageEl = document.getElementById('pipelineStage');
  const pctEl = document.getElementById('pipelinePct');
  const fillEl = document.getElementById('pipelineFill');
  const summaryEl = document.getElementById('pipelineSummary');
  const afterFillEl = document.getElementById('pipelineAfterFill');
  const afterPctEl = document.getElementById('pipelineAfterPct');
  const chipEls = {
    geo: pipeline.querySelector('.pipeline-chip[data-layer="geo"]'),
    geophys: pipeline.querySelector('.pipeline-chip[data-layer="geophys"]'),
    geochem: pipeline.querySelector('.pipeline-chip[data-layer="geochem"]'),
  };

  // The isometric block illustration: survey layers paint onto its top
  // face, a glow marks the probable orebody, and the fence of drill
  // holes pierces down through it.
  const lithologyEl = document.getElementById('blockLithology');
  const contoursEl = document.getElementById('blockContours');
  const geochemEl = document.getElementById('blockGeochem');
  const hotspotEl = document.getElementById('blockHotspot');
  const holeGroups = Array.from(pipeline.querySelectorAll('.block-hole'));
  const target1El = document.getElementById('blockTarget1');
  const target2El = document.getElementById('blockTarget2');

  // Eight stills, seven transitions: prior -> three data layers closing
  // the uncertainty band -> a first target -> drilling (six holes) ->
  // logged core -> the next target.
  const stages = [
    { label: '',                                              pct: 62, chips: [],                            lithology: false, contours: false, geochem: false, hotspotR: 0,  hotspotOp: 0,    holes: 'none',    targets: [] },
    { label: 'Geological mapping',                                                pct: 47, chips: ['geo'],                       lithology: true,  contours: false, geochem: false, hotspotR: 0,  hotspotOp: 0,    holes: 'none',    targets: [] },
    { label: '+ Geophysics',                                                      pct: 35, chips: ['geo', 'geophys'],            lithology: true,  contours: true,  geochem: false, hotspotR: 0,  hotspotOp: 0,    holes: 'none',    targets: [] },
    { label: '+ Geochemistry',                                                    pct: 26, chips: ['geo', 'geophys', 'geochem'], lithology: true,  contours: true,  geochem: true,  hotspotR: 34, hotspotOp: 0.55, holes: 'none',    targets: [] },
    { label: 'First drill target',                                                pct: 26, chips: ['geo', 'geophys', 'geochem'], lithology: true,  contours: true,  geochem: true,  hotspotR: 34, hotspotOp: 0.6,  holes: 'none',    targets: ['t1'] },
    { label: 'Drilling',                                                          pct: 18, chips: ['geo', 'geophys', 'geochem'], lithology: true,  contours: true,  geochem: true,  hotspotR: 26, hotspotOp: 0.75, holes: 'drilled', targets: ['t1'] },
    { label: 'Core logs and assays',                                              pct: 14, chips: ['geo', 'geophys', 'geochem'], lithology: true,  contours: true,  geochem: true,  hotspotR: 20, hotspotOp: 0.88, holes: 'logged',  targets: ['t1'] },
    { label: 'Next drill target',                                                 pct: 14, chips: ['geo', 'geophys', 'geochem'], lithology: true,  contours: true,  geochem: true,  hotspotR: 20, hotspotOp: 0.88, holes: 'logged',  targets: ['t1', 't2'], summary: true },
  ];

  const LAST_PCT = stages[stages.length - 1].pct;

  function render(index) {
    const s = stages[index];

    stageEl.textContent = s.label;
    pctEl.textContent = '±' + s.pct + '%';
    fillEl.style.width = s.pct + '%';

    Object.keys(chipEls).forEach((key) => {
      const on = s.chips.indexOf(key) !== -1;
      if (chipEls[key]) chipEls[key].classList.toggle('is-on', on);
    });

    if (lithologyEl) lithologyEl.classList.toggle('is-on', s.lithology);
    if (contoursEl) contoursEl.classList.toggle('is-on', s.contours);
    if (geochemEl) geochemEl.classList.toggle('is-on', s.geochem);
    if (hotspotEl) {
      hotspotEl.setAttribute('r', s.hotspotR);
      hotspotEl.setAttribute('opacity', s.hotspotOp);
    }

    holeGroups.forEach((hole) => {
      hole.classList.toggle('is-drilled', s.holes === 'drilled');
      hole.classList.toggle('is-logged', s.holes === 'logged');
    });

    if (target1El) target1El.classList.toggle('is-on', s.targets.indexOf('t1') !== -1);
    if (target2El) target2El.classList.toggle('is-on', s.targets.indexOf('t2') !== -1);

    const showSummary = !!s.summary;
    if (summaryEl) summaryEl.classList.toggle('is-on', showSummary);
    if (afterFillEl) afterFillEl.style.width = (showSummary ? LAST_PCT : 0) + '%';
    if (showSummary && afterPctEl) afterPctEl.textContent = '±' + LAST_PCT + '%';
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // No motion: show the fullest, most informative frame instead of cycling.
    render(stages.length - 1);
    return;
  }

  const STAGE_MS = 2200;
  const HOLD_MS = 4200; // linger on the completed frame before looping back

  let current = 0;
  let timer = null;

  render(0);

  function step() {
    current = (current + 1) % stages.length;
    render(current);
    const isLast = current === stages.length - 1;
    timer = setTimeout(step, isLast ? HOLD_MS : STAGE_MS);
  }

  function start() {
    if (timer) return;
    timer = setTimeout(step, STAGE_MS);
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  const pipelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    },
    { threshold: 0.4 }
  );

  pipelineObserver.observe(pipeline);
})();
