/**
 * Amiruan — Personal Portfolio Interaction Controller
 * Handles navigation, terminal, project filtering, UX Pathfinder, and animations.
 */

(function () {
  'use strict';

  // State
  const state = {
    terminalOpen: false,
    mobileMenuOpen: false,
    pathfinderOpen: false,
    pathfinderActive: false,
    currentFilter: 'all',
  };

  // Elements
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const terminalOverlay = document.getElementById('terminalOverlay');
  const terminalInput = document.getElementById('terminalInput');
  const terminalLog = document.getElementById('terminalLog');
  const terminalBody = document.getElementById('terminalBody');
  const terminalClose = document.getElementById('terminalClose');
  const aiToggle = document.getElementById('aiToggle');
  const heroTerminalBtn = document.getElementById('heroTerminalBtn');
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const localTimeEl = document.getElementById('localTime');
  const yearEl = document.getElementById('year');
  const navLinks = document.querySelectorAll('.nav__link');
  const mobileLinks = document.querySelectorAll('.mobile-menu .nav__link');
  const uxPathfinderToggle = document.getElementById('uxPathfinderToggle');
  const uxPathfinderPanel = document.getElementById('uxPathfinderPanel');
  const uxPathfinderBackdrop = document.getElementById('uxPathfinderBackdrop');
  const uxPathfinderClose = document.getElementById('uxPathfinderClose');
  const uxPathfinderList = document.getElementById('uxPathfinderList');

  // Utilities
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function scrollToElement(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const offset = header ? header.offsetHeight + 20 : 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    el.focus({ preventScroll: true });
  }

  // Header scroll effect
  function handleScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  // Mobile menu
  function toggleMobileMenu(force = null) {
    state.mobileMenuOpen = force !== null ? force : !state.mobileMenuOpen;
    mobileMenu.classList.toggle('open', state.mobileMenuOpen);
    mobileToggle.setAttribute('aria-expanded', String(state.mobileMenuOpen));
    mobileMenu.setAttribute('aria-hidden', String(!state.mobileMenuOpen));
    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
  }

  // Terminal
  function openTerminal() {
    state.terminalOpen = true;
    terminalOverlay.classList.add('open');
    terminalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => terminalInput.focus(), 100);
  }

  function closeTerminal() {
    state.terminalOpen = false;
    terminalOverlay.classList.remove('open');
    terminalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleTerminal() {
    state.terminalOpen ? closeTerminal() : openTerminal();
  }

  function addLog(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `terminal-log__entry terminal-log__entry--${type}`;
    entry.innerHTML = message;
    terminalLog.appendChild(entry);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // AI Commands
  const commandResponses = {
    stacks: `
      <strong>Primary Stack:</strong><br>
      • Frontend: React, Next.js, TypeScript, Tailwind CSS, Framer Motion<br>
      • WordPress: ACF Pro, CPT, REST/GraphQL, Custom Hooks, Docker<br>
      • AI: OpenAI API, Gemini, LangChain, WebSockets, Vector DBs<br>
      • Design: Figma, Storybook, Zeroheight
    `,
    stack: 'alias for "stacks" — see response above.',
    projects: `
      <strong>Selected Projects:</strong><br>
      • Fintech Dashboard Design System — UI/UX<br>
      • Headless Commerce Platform — WordPress<br>
      • AI Knowledge Assistant — AI<br>
      • Automated Printing Pipeline — WordPress<br>
      • Global Brand Website Redesign — UI/UX<br>
      • AI Kiosk Interface — AI<br>
      <em>Type a category (uiux, wordpress, ai) to filter the grid.</em>
    `,
    work: 'alias for "projects"',
    gallery: `
      <strong>Gallery:</strong> the human side of the portfolio — events, travels, and studio moments. Feed styled like a personal Instagram.<br>
      • 10 posts across events, travel, studio, and moments<br>
      • Browse categories with “filter events”, “filter travel”, “filter studio”, “filter moments”<br>
      <a href="/gallery" style="color: var(--accent-coral); text-decoration: underline; font-family: var(--font-mono);">Open gallery →</a>
    `,
    life: 'alias for "gallery"',
    contact: `
      <strong>Contact:</strong><br>
      • Email: hello@amiruan.dev<br>
      • Location: Kuala Lumpur, Malaysia (MYT)<br>
      • Availability: Open for Q3 2026 projects<br>
      <em>Scroll to the Contact section or open the UX Pathfinder to learn more.</em>
    `,
    availability: `
      <strong>Status:</strong> Available for UI/UX, WordPress, and AI integration projects.<br>
      Typical response time: within 24 hours.
    `,
    hire: 'alias for "availability"',
    about: `
      <strong>Amiruan</strong> (Muhammad Amiruddin) is a 25-year-old creative web developer based in Kuala Lumpur, merging UI/UX, WordPress engineering, and AI workflows.
    `,
    whoami: 'You are a visitor exploring Amiruan\'s digital workstation. Welcome.',
    ux: `
      <strong>UX Pathfinder:</strong> Click the <strong>UX Pathfinder</strong> button in the header to see the Laws of UX applied across this site.
    `,
    laws: 'alias for "ux"',
    help: `
      <strong>Available commands:</strong> stacks, projects, gallery, contact, availability, about, ux, filter uiux, filter wordpress, filter ai, clear, help
    `,
    clear: '__CLEAR__',
  };

  commandResponses.stack = commandResponses.stacks;
  commandResponses.work = commandResponses.projects;
  commandResponses.hire = commandResponses.availability;
  commandResponses.laws = commandResponses.ux;
  commandResponses.life = commandResponses.gallery;
  commandResponses.photos = commandResponses.gallery;

  function processCommand(rawInput) {
    const input = rawInput.toLowerCase().trim();
    if (!input) return;

    addLog(`&gt; ${escapeHtml(rawInput)}`, 'user');

    const filterMatch = input.match(/filter\s+(uiux|wordpress|ai|all)/);
    if (filterMatch) {
      const category = filterMatch[1];
      filterProjects(category);
      addLog(`Filtered projects to: <strong>${category === 'all' ? 'All' : category.toUpperCase()}</strong>`, 'response');
      return;
    }

    if (commandResponses[input]) {
      if (commandResponses[input] === '__CLEAR__') {
        terminalLog.innerHTML = '';
        addLog('Terminal cleared.', 'system');
        return;
      }
      addLog(commandResponses[input], 'response');
      return;
    }

    if (input.includes('stack') || input.includes('tech') || input.includes('use')) {
      addLog(commandResponses.stacks, 'response');
      return;
    }
    if (input.includes('project') || input.includes('case') || input.includes('portfolio')) {
      addLog(commandResponses.projects, 'response');
      return;
    }
    if (input.includes('contact') || input.includes('email') || input.includes('reach')) {
      addLog(commandResponses.contact, 'response');
      return;
    }
    if (input.includes('available') || input.includes('hire') || input.includes('free')) {
      addLog(commandResponses.availability, 'response');
      return;
    }
    if (input.includes('who') || input.includes('about') || input.includes('amir')) {
      addLog(commandResponses.about, 'response');
      return;
    }
    if (input.includes('ux') || input.includes('law') || input.includes('pathfinder')) {
      addLog(commandResponses.ux, 'response');
      return;
    }
    if (input.includes('gallery') || input.includes('life') || input.includes('photo') || input.includes('timeline')) {
      addLog(commandResponses.gallery, 'response');
      return;
    }

    addLog(`Command not recognized: “${escapeHtml(rawInput)}”. Try <strong>help</strong> or <strong>ux</strong>.`, 'error');
  }

  // Project Filtering
  function filterProjects(category) {
    state.currentFilter = category;
    const cards = document.querySelectorAll('.work-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach((btn) => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    cards.forEach((card) => {
      const shouldShow = category === 'all' || card.dataset.category === category;
      card.classList.toggle('hidden', !shouldShow);
    });
  }

  function initFilters() {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => filterProjects(btn.dataset.filter));
    });
  }

  // Scroll Reveal
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (prefersReducedMotion()) {
      reveals.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  // Skill Meters
  function initSkillMeters() {
    const meters = document.querySelectorAll('.bento__meter-fill');
    if (prefersReducedMotion()) {
      meters.forEach((m) => (m.style.width = m.dataset.width + '%'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => (entry.target.style.width = entry.target.dataset.width + '%'), 200);
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.5 }
    );
    meters.forEach((m) => observer.observe(m));
  }

  // Active Nav
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
        }
      }),
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  // Contact Form
  function initContactForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name')?.toString().trim();
      const email = formData.get('email')?.toString().trim();
      const projectType = formData.get('projectType')?.toString();
      const message = formData.get('message')?.toString().trim();

      if (!name || !email || !message || !projectType) {
        formStatus.style.color = '#f87171';
        formStatus.innerHTML = '<span>⚠</span> Please fill in all required fields.';
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        formStatus.style.color = 'var(--accent-sage)';
        formStatus.innerHTML = '<span>✓</span> Message received. I’ll be in touch within 24 hours.';
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  // Local Time MYT
  function updateLocalTime() {
    if (!localTimeEl) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    localTimeEl.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
  }

  // UX Pathfinder
  function collectUxLaws() {
    const elements = document.querySelectorAll('[data-ux-law]');
    const map = new Map();
    elements.forEach((el) => {
      const name = el.dataset.uxLaw.trim();
      const desc = el.dataset.uxDesc?.trim() || '';
      const selector = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
      if (!map.has(name)) {
        map.set(name, { name, desc, elements: [] });
      }
      map.get(name).elements.push({ el, selector });
    });
    return Array.from(map.values());
  }

  function renderUxLawCards() {
    if (!uxPathfinderList) return;
    const laws = collectUxLaws();
    uxPathfinderList.innerHTML = laws.map((law) => `
      <article class="ux-law-card" data-law="${escapeHtml(law.name)}">
        <div class="ux-law-card__name">
          ${escapeHtml(law.name)}
          <a href="https://lawsofux.com/" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">lawsofux.com ↗</a>
        </div>
        <p class="ux-law-card__desc">${escapeHtml(law.desc)}</p>
        <div class="ux-law-card__usage">Applied to ${law.elements.length} section${law.elements.length !== 1 ? 's' : ''}</div>
      </article>
    `).join('');

    uxPathfinderList.querySelectorAll('.ux-law-card').forEach((card) => {
      card.addEventListener('click', () => selectLaw(card.dataset.law));
    });
  }

  function clearSelectedLaw() {
    document.querySelectorAll('[data-ux-law].ux-law--selected').forEach((el) => {
      el.classList.remove('ux-law--selected');
    });
  }

  function selectLaw(lawName) {
    clearSelectedLaw();
    setPathfinderActive(true);
    closePathfinder();

    const matches = document.querySelectorAll(`[data-ux-law="${lawName}"]`);
    if (!matches.length) return;

    matches.forEach((el) => el.classList.add('ux-law--selected'));

    const first = matches[0];
    const id = first.id ? `#${first.id}` : null;
    if (id) scrollToElement(id);
    else first.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      matches.forEach((el) => el.classList.remove('ux-law--selected'));
    }, 3500);
  }

  function injectUxLabels() {
    document.querySelectorAll('[data-ux-law]').forEach((el) => {
      if (el.querySelector('.ux-law-label')) return;
      const label = document.createElement('span');
      label.className = 'ux-law-label';
      label.textContent = el.dataset.uxLaw;
      label.setAttribute('aria-hidden', 'true');
      el.style.position = 'relative';
      el.appendChild(label);
    });
  }

  function setPathfinderActive(active) {
    state.pathfinderActive = active;
    document.body.classList.toggle('ux-pathfinder-active', active);
    uxPathfinderToggle.classList.toggle('active', active);
    if (active) injectUxLabels();
  }

  function openPathfinder() {
    state.pathfinderOpen = true;
    uxPathfinderPanel.classList.add('open');
    uxPathfinderBackdrop.classList.add('open');
    uxPathfinderPanel.setAttribute('aria-hidden', 'false');
    uxPathfinderBackdrop.setAttribute('aria-hidden', 'false');
    uxPathfinderToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setPathfinderActive(true);
  }

  function closePathfinder() {
    state.pathfinderOpen = false;
    uxPathfinderPanel.classList.remove('open');
    uxPathfinderBackdrop.classList.remove('open');
    uxPathfinderPanel.setAttribute('aria-hidden', 'true');
    uxPathfinderBackdrop.setAttribute('aria-hidden', 'true');
    uxPathfinderToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function togglePathfinder() {
    state.pathfinderOpen ? closePathfinder() : openPathfinder();
  }

  function initPathfinder() {
    if (!uxPathfinderToggle || !uxPathfinderPanel) return;
    renderUxLawCards();
    uxPathfinderToggle.addEventListener('click', togglePathfinder);
    uxPathfinderClose.addEventListener('click', closePathfinder);
    uxPathfinderBackdrop.addEventListener('click', closePathfinder);
  }

  // Event Listeners
  function initEventListeners() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    mobileToggle.addEventListener('click', () => toggleMobileMenu());
    mobileLinks.forEach((link) => link.addEventListener('click', () => toggleMobileMenu(false)));
    aiToggle.addEventListener('click', openTerminal);
    if (heroTerminalBtn) heroTerminalBtn.addEventListener('click', openTerminal);
    terminalClose.addEventListener('click', closeTerminal);
    terminalOverlay.addEventListener('click', (e) => { if (e.target === terminalOverlay) closeTerminal(); });
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        processCommand(terminalInput.value);
        terminalInput.value = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleTerminal();
      }
      if (e.key === 'Escape') {
        if (state.terminalOpen) closeTerminal();
        if (state.mobileMenuOpen) toggleMobileMenu(false);
        if (state.pathfinderOpen) closePathfinder();
      }
    });
  }

  // Boot
  function boot() {
    handleScroll();
    initEventListeners();
    initFilters();
    initReveal();
    initSkillMeters();
    initActiveNav();
    initContactForm();
    initPathfinder();
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    updateLocalTime();
    setInterval(updateLocalTime, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
