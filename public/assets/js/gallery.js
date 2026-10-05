/**
 * Amiruan — Gallery Interactions
 * Renders the profile, story filters, feed, carousels, likes, and lightbox
 * from the zero-code content model in assets/js/data/posts.js.
 */
(function () {
  'use strict';

  // State
  const state = {
    activeFilter: 'all',
    visibleCount: 9,
  };

  // Elements
  const storiesEl = document.getElementById('gStories');
  const feedEl = document.getElementById('gFeed');
  const loadMoreBtn = document.getElementById('gLoadMore');
  const endNote = document.getElementById('gEndNote');
  const lb = document.getElementById('gLightbox');
  const lbImg = document.getElementById('gLbImg');
  const lbCounter = document.getElementById('gLbCounter');
  const lbSide = document.getElementById('gLbSide');
  const lbClose = document.getElementById('gLbClose');
  const lbPrev = document.getElementById('gLbPrev');
  const lbNext = document.getElementById('gLbNext');

  const data = window.galleryData || { profile: {}, highlights: [], posts: [] };
  const LIKE_STORE = 'amiruan_gallery_likes';
  let lbQueue = [];
  let lbIndex = 0;

  // Utilities
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
  }

  function readLikeMap() {
    return readStore(LIKE_STORE, {});
  }

  function likedFor(id) {
    return !!readLikeMap()[id];
  }

  function setLiked(id) {
    const map = readLikeMap();
    const next = !map[id];
    if (next) map[id] = true;
    else delete map[id];
    writeStore(LIKE_STORE, map);
    return next;
  }

  const TYPE_EMOJI = {
    events: '🎤',
    travel: '✈️',
    studio: '🖥',
    moments: '🌙',
  };

  const ICONS = {
    heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    expand: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>',
  };

  // ── Story filters ─────────────────────────────────────────────────────────────
  function renderStories() {
    if (!storiesEl) return;
    storiesEl.innerHTML = data.highlights.map((h) => `
      <button class="g-story ${h.id === state.activeFilter ? 'is-active' : ''}" data-filter="${esc(h.id)}" role="tab" aria-selected="${h.id === state.activeFilter}">
        <span class="g-story__ring">
          <span class="g-story__inner">
            <span class="g-story__emoji g-story__tone--${esc(h.tone)}">${h.id === 'all' ? '◌' : TYPE_EMOJI[h.id] || '✦'}</span>
          </span>
        </span>
        ${esc(h.label)}
      </button>
    `).join('');

    storiesEl.addEventListener('click', (e) => {
      const story = e.target.closest('.g-story');
      if (!story) return;
      setFilter(story.dataset.filter);
    });
  }

  // ── Feed ──────────────────────────────────────────────────────────────────────
  function filteredPosts() {
    return data.posts.filter((p) => state.activeFilter === 'all' || p.type === state.activeFilter);
  }

  function postMediaMarkup(post) {
    const multi = post.media.length > 1;
    return `
      <div class="g-post__media">
        <div class="g-post__track">
          ${post.media.map((m, i) => `
            <div class="g-post__slide" data-slide="${i}">
              <img src="${esc(m)}" alt="${esc(post.title)} — photo ${i + 1}" loading="lazy">
            </div>
          `).join('')}
        </div>
        ${multi ? `
          <button class="g-post__nav g-post__nav--prev" type="button" aria-label="Previous photo">‹</button>
          <button class="g-post__nav g-post__nav--next" type="button" aria-label="Next photo">›</button>
          <div class="g-post__dots" aria-hidden="true">${post.media.map((_, i) => `<span class="g-post__dot ${i === 0 ? 'is-on' : ''}"></span>`).join('')}</div>
          <span class="g-post__count">1/${post.media.length}</span>
        ` : ''}
        <span class="g-post__type">${esc(post.type)}</span>
      </div>
    `;
  }

  function postMarkup(post) {
    const liked = likedFor(post.id);
    return `
      <article class="g-post ${post.wide ? 'g-post--wide' : ''}" data-id="${esc(post.id)}" data-type="${esc(post.type)}">
        ${postMediaMarkup(post)}
        <div class="g-post__body">
          <p class="g-post__caption">${esc(post.caption)}</p>
          <div class="g-post__tags">${post.tags.map((t) => `<span class="g-post__tag">${esc(t)}</span>`).join('')}</div>
          <div class="g-post__footer">
            <button class="g-action g-like ${liked ? 'is-liked' : ''}" type="button" aria-pressed="${liked}" aria-label="Like post">
              ${ICONS.heart}
            </button>
            <button class="g-action g-open-lb" type="button" aria-label="Open in viewer">${ICONS.expand}</button>
            <span class="g-post__meta">${esc(post.date)} · ${esc(post.location)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderFeed() {
    if (!feedEl) return;
    const posts = filteredPosts();
    const visible = posts.slice(0, state.visibleCount);
    feedEl.innerHTML = visible.map(postMarkup).join('');
    if (loadMoreBtn) loadMoreBtn.hidden = state.visibleCount >= posts.length;
    if (endNote) endNote.hidden = state.visibleCount < posts.length;
    initPostBehaviors();
  }

  function setFilter(id) {
    state.activeFilter = id;
    state.visibleCount = 9;
    renderStories();
    renderFeed();
    feedEl.focus({ preventScroll: true });
  }

  // ── Post behaviors ────────────────────────────────────────────────────────────
  function initPostBehaviors() {
    feedEl.querySelectorAll('.g-post').forEach((postEl) => {
      const post = data.posts.find((p) => p.id === postEl.dataset.id);
      if (!post) return;

      const track = postEl.querySelector('.g-post__track');
      const prev = postEl.querySelector('.g-post__nav--prev');
      const next = postEl.querySelector('.g-post__nav--next');
      const dots = postEl.querySelectorAll('.g-post__dot');
      const countEl = postEl.querySelector('.g-post__count');
      const openBtn = postEl.querySelector('.g-open-lb');

      let idx = 0;
      function goTo(i, smooth = true) {
        if (!track) return;
        idx = Math.max(0, Math.min(post.media.length - 1, i));
        track.scrollTo({ left: idx * track.clientWidth, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
      }
      if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx - 1); });
      if (next) next.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx + 1); });

      let scrollTimer;
      function onScroll() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const slideW = track.clientWidth || 1;
          idx = Math.round(track.scrollLeft / slideW);
          dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
          if (countEl) countEl.textContent = `${idx + 1}/${post.media.length}`;
        }, 120);
      }
      if (track) track.addEventListener('scroll', onScroll, { passive: true });

      // Like (grid)
      const likeBtn = postEl.querySelector('.g-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          applyLike(postEl, post);
        });
      }

      // Open lightbox on card click
      postEl.addEventListener('click', (e) => {
        if (e.target.closest('.g-like')) return;
        openLightbox(post.id, idx);
      });
      if (openBtn) {
        openBtn.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(post.id, idx); });
      }
    });
  }

  function applyLike(postEl, post) {
    const liked = setLiked(post.id);
    const likeBtn = postEl.querySelector('.g-like');
    if (likeBtn) {
      likeBtn.classList.toggle('is-liked', liked);
      likeBtn.setAttribute('aria-pressed', String(liked));
      if (liked) {
        likeBtn.classList.add('g-heart-pop');
        setTimeout(() => likeBtn.classList.remove('g-heart-pop'), 600);
      }
    }
    syncLightboxLike(post.id);
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────────
  function buildLightboxQueue() {
    const queue = [];
    filteredPosts().forEach((p) => p.media.forEach((m, mi) => queue.push({ post: p, mediaIndex: mi })));
    return queue;
  }

  function openLightbox(postId, mediaIndex) {
    const queue = buildLightboxQueue();
    let found = -1;
    queue.forEach((item, i) => {
      if (item.post.id === postId && item.mediaIndex === mediaIndex) found = i;
    });
    if (found < 0) return;
    lbQueue = queue;
    lbIndex = found;
    showLightboxSlide();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function showLightboxSlide() {
    const { post, mediaIndex } = lbQueue[lbIndex];
    lbImg.src = post.media[mediaIndex];
    lbImg.alt = `${post.title} — photo ${mediaIndex + 1}`;
    lbCounter.textContent = `${lbIndex + 1} / ${lbQueue.length}`;
    lbPrev.disabled = lbQueue.length <= 1;
    lbNext.disabled = lbQueue.length <= 1;

    const liked = likedFor(post.id);
    const currentMedia = post.media[mediaIndex];
    lbSide.innerHTML = `
      <div class="g-lb-head">
        <div>
          <span class="g-lb-label">${esc(post.type)} · ${esc(post.location)}</span>
          <strong class="g-lb-title">${esc(post.title)}</strong>
        </div>
      </div>
      <p class="g-lb-caption">${esc(post.caption)}</p>
      <div class="g-lb-tags">${post.tags.map((t) => `<span class="g-lb-tag">${esc(t)}</span>`).join('')}</div>
      <div class="g-lb-stats">
        <div class="g-lb-stat"><span>Likes</span><strong id="gLbLikes">${(post.likes + (liked ? 1 : 0)).toLocaleString()}</strong></div>
        <div class="g-lb-stat"><span>Views</span><strong>${esc(post.views)}</strong></div>
        <div class="g-lb-stat"><span>Posted</span><strong>${esc(post.date)}</strong></div>
        <div class="g-lb-stat"><span>Camera</span><strong>${esc(post.camera)}</strong></div>
      </div>
      <div class="g-lb-actions">
        <button class="g-lb-like ${liked ? 'is-liked' : ''}" type="button" id="gLbLike">${liked ? '♥ Liked' : '♥ Like'}</button>
        <a class="g-lb-download" href="${esc(currentMedia)}" download="${esc(post.id)}-${esc(mediaIndex + 1)}.svg">Download</a>
      </div>
      <span class="g-lb-close-link">Press Esc or tap X to close</span>
    `;
    const lbLikeBtn = document.getElementById('gLbLike');
    if (lbLikeBtn) {
      lbLikeBtn.addEventListener('click', () => {
        const likedState = setLiked(post.id);
        lbLikeBtn.classList.toggle('is-liked', likedState);
        lbLikeBtn.textContent = likedState ? '♥ Liked' : '♥ Like';
        const counter = document.getElementById('gLbLikes');
        if (counter) {
          counter.textContent = (post.likes + (likedState ? 1 : 0)).toLocaleString();
        }
      });
    }
  }

  function syncLightboxLike(postId) {
    if (!lb.hidden && lbQueue.length) {
      const { post } = lbQueue[lbIndex];
      if (post.id !== postId) return;
      const liked = likedFor(postId);
      const likeBtn = document.getElementById('gLbLike');
      const counter = document.getElementById('gLbLikes');
      if (likeBtn) {
        likeBtn.classList.toggle('is-liked', liked);
        likeBtn.textContent = liked ? '♥ Liked' : '♥ Like';
      }
      if (counter) counter.textContent = (post.likes + (liked ? 1 : 0)).toLocaleString();
    }
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + lbQueue.length) % lbQueue.length;
    showLightboxSlide();
  }

  function initLightbox() {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => stepLightbox(-1));
    lbNext.addEventListener('click', () => stepLightbox(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  function boot() {
    renderStories();
    renderFeed();
    initLightbox();
    loadMoreBtn.addEventListener('click', () => {
      state.visibleCount += 6;
      renderFeed();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();