const header = document.querySelector('#site-header');
const progress = document.querySelector('.scroll-progress span');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const slides = [...document.querySelectorAll('.project-slide')];
const dots = [...document.querySelectorAll('.project-dots button')];
const leadForm = document.querySelector('#lead-form');
const formStatus = document.querySelector('.form-status');
const heroVideo = document.querySelector('#hero-video');
const videoControl = document.querySelector('.video-control');
const floatingCta = document.querySelector('.floating-cta');
let projectIndex = 0;
let projectTimer;

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', y > 30);
  floatingCta.classList.toggle('show', y > window.innerHeight * 0.55);
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

function toggleMenu() {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  if (open) return closeMenu();
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close menu');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  mobileMenu.querySelector('a').focus();
}

function showProject(nextIndex) {
  projectIndex = (nextIndex + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === projectIndex;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  dots.forEach((dot, i) => {
    const active = i === projectIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-selected', String(active));
  });
}

function restartProjectTimer() {
  window.clearInterval(projectTimer);
  projectTimer = window.setInterval(() => showProject(projectIndex + 1), 6500);
}

function loadHeroVideo() {
  const source = 'https://video.squarespace-cdn.com/content/v1/65a2b0c7fd3e85633a1a7089/1f02554c-bdbc-43ef-882d-d83ecd389f90/playlist.m3u8';
  if (window.Hls?.isSupported()) {
    const hls = new window.Hls({ maxBufferLength: 15, startLevel: 0 });
    hls.loadSource(source);
    hls.attachMedia(heroVideo);
  } else if (heroVideo.canPlayType('application/vnd.apple.mpegurl')) {
    heroVideo.src = source;
  }
  heroVideo.play().catch(() => {
    videoControl.classList.add('paused');
    videoControl.lastChild.textContent = 'Play film';
    videoControl.setAttribute('aria-label', 'Play background film');
  });
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
loadHeroVideo();
videoControl.addEventListener('click', () => {
  if (heroVideo.paused) {
    heroVideo.play();
    videoControl.classList.remove('paused');
    videoControl.lastChild.textContent = 'Pause film';
    videoControl.setAttribute('aria-label', 'Pause background film');
  } else {
    heroVideo.pause();
    videoControl.classList.add('paused');
    videoControl.lastChild.textContent = 'Play film';
    videoControl.setAttribute('aria-label', 'Play background film');
  }
});
menuToggle.addEventListener('click', toggleMenu);
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
  if (event.key === 'ArrowRight' && document.activeElement.closest?.('.project-stage')) showProject(projectIndex + 1);
  if (event.key === 'ArrowLeft' && document.activeElement.closest?.('.project-stage')) showProject(projectIndex - 1);
});

document.querySelector('.project-next').addEventListener('click', () => { showProject(projectIndex + 1); restartProjectTimer(); });
document.querySelector('.project-prev').addEventListener('click', () => { showProject(projectIndex - 1); restartProjectTimer(); });
dots.forEach((dot, index) => dot.addEventListener('click', () => { showProject(index); restartProjectTimer(); }));
restartProjectTimer();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

leadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.className = 'form-status show';
  if (!leadForm.checkValidity()) {
    formStatus.classList.add('error');
    formStatus.textContent = 'Please complete the required fields so we can understand your project.';
    leadForm.reportValidity();
    return;
  }
  const firstName = new FormData(leadForm).get('firstName');
  formStatus.textContent = `Thank you, ${firstName}. This preview is ready to connect to the company’s email or CRM. For immediate service, call (561) 965-9696.`;
  leadForm.reset();
});

document.querySelector('#year').textContent = new Date().getFullYear();
