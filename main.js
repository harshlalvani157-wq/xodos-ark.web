/* XoDos-Ark Mobile Auto-Scale & Glass UI Engine */
(function() {
  'use strict';

  // 1. Mobile Viewport Height Adapter (fixes mobile browser address bar jumps)
  function updateViewportUnits() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vvh', vh + 'px');
  }
  updateViewportUnits();
  window.addEventListener('resize', updateViewportUnits, { passive: true });
  window.addEventListener('orientationchange', updateViewportUnits, { passive: true });

  // 2. Reveal animations (Low-power IntersectionObserver)
  var revealElements = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(function(el) { el.classList.add('in'); });
  } else {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(function(el) { observer.observe(el); });
  }

  // 3. Mobile Glass Menu Controller
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  menu.addEventListener('click', function(event) {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', function(event) {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  }, { passive: true });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeMenu();
  });

  // 4. Copy the Android command without exposing it in the URL or page state.
  var copyButton = document.getElementById('copyCommand');
  var command = document.getElementById('phantomCommand');
  if (copyButton && command) {
    copyButton.addEventListener('click', function() {
      var text = command.textContent.trim();
      var copied = function() {
        copyButton.classList.add('is-copied');
        copyButton.querySelector('span').textContent = 'Copied';
        window.setTimeout(function() {
          copyButton.classList.remove('is-copied');
          copyButton.querySelector('span').textContent = 'Copy';
        }, 1800);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(copied).catch(function() {});
      } else {
        var helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        try {
          if (document.execCommand('copy')) copied();
        } finally {
          document.body.removeChild(helper);
        }
      }
    });
  }
})();


/* ==========================================================================\
   Live GitHub contributor roster for XoDos-Ark
   Uses the public contributors endpoint; README team is a labelled fallback.
   ========================================================================== */
(function() {
  'use strict';
  var section = document.getElementById('contributors');
  if (!section) return;

  var track = section.querySelector('[data-contributor-track]');
  var status = section.querySelector('[data-contributor-status]');
  var count = section.querySelector('[data-contributor-count]');
  if (!track || !status || !count) return;

  var API = 'https://api.github.com/repos/xodiosx/XoDos-Ark/contributors?per_page=100';
  var CACHE_KEY = 'xodos-ark-contributors-v1';
  var CACHE_TTL = 6 * 60 * 60 * 1000;
  var coreTeam = [
  //  { login: 'xodiosx', contributions: null, label: 'Leader'},
    //{ login: 'Karysdeveloper', contributions: null },
//    { login: 'Mondo67244', contributions: null },
   // { login: 'jiaxinchen-max', contributions: null },
 //   { login: 'Snap888', contributions: null }
 ];

  // Community members supplied by the project owner. These stay visible even
  // when they have not made a commit to the repository yet.
  var featuredContributors = [
    { login: 'xodiosx' , label: 'LEADER' },
    { login: 'tanmaysoren' , label: 'Project contributor' },
    { login: 'harshlalvani157-wq', label: 'Project contributor' },
    { login: 'tokokudo', label: 'Project contributor' },
    { login: 'Smithy1976', label: 'Project contributor' },
    { login: 'KarysDeveloper', label: 'Project contributor' },
    { login: 'mebabo1', label: 'Project contributor' },
    { name: 'Theames', avatar_url: 'assets/theames-discord.png', url: 'https://discord.gg/d2ChVhPfnF', label: 'project contributor' },
    { login: 'CosmyBeyondStars', label:'project contributor' },
    { login: 'Beauty114514', label:'project contributor'},
    { login: 'KianoRoku18Ino' , label:'project contributor'} ,
    { login: 'PremLalvani',label:'project contributors '} 
  ];

  function mergeContributors(users) {
    var merged = [];
    var seen = Object.create(null);
    featuredContributors.concat(users || []).forEach(function(user) {
      if (!user) return;
      var key = String(user.login || user.name || '').toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      merged.push(user);
    });
    return merged;
  }

  function safeReadCache() {
    try {
      var cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.savedAt && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.users)) {
        return cached.users;
      }
    } catch (error) { /* Storage may be unavailable in private browsing. */ }
    return null;
  }

  function safeWriteCache(users) {
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), users: users })); }
    catch (error) { /* The live roster still works without local caching. */ }
  }

  function profileUrl(login) {
    return 'https://github.com/' + encodeURIComponent(login);
  }

  function makePerson(user, isClone) {
    var login = String(user.login || '').trim();
    var displayName = String(user.name || login).trim();
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(login || displayName)) return null;

    var link = document.createElement('a');
    link.className = 'contributors-person';
    link.href = user.url || profileUrl(login);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', user.url ? 'Open XoDos-Ark Discord community for ' + displayName : 'Open GitHub profile for ' + login);
    if (isClone) link.tabIndex = -1;

    // Circular profile image, matching the deployed contributors layout.
    var avatarShell = document.createElement('span');
    avatarShell.className = 'contributors-avatar-shell';
    avatarShell.setAttribute('aria-hidden', 'true');

    var avatar = document.createElement('img');
    avatar.alt = '';
    avatar.loading = 'lazy';
    avatar.decoding = 'async';
    avatar.src = user.avatar_url || (login ? 'https://github.com/' + encodeURIComponent(login) + '.png?size=160' : '');
    avatar.referrerPolicy = 'no-referrer';
    avatar.onerror = function() {
      avatarShell.textContent = (displayName.charAt(0) || '?').toUpperCase();
      avatarShell.classList.add('contributors-avatar-fallback');
    };
    if (avatar.src) avatarShell.appendChild(avatar);
    link.appendChild(avatarShell);

    var name = document.createElement('span');
    name.className = 'contributors-name';
    name.textContent = displayName;
    link.appendChild(name);

    var commits = document.createElement('span');
    commits.className = 'contributors-commits';
    commits.textContent = user.label || (Number.isFinite(Number(user.contributions)) && user.contributions !== null
      ? Number(user.contributions).toLocaleString() + ' commits'
      : 'Core team');
    link.appendChild(commits);
    return link;
  }

  function render(users, sourceLabel) {
    var valid = mergeContributors(users).filter(function(user) {
      return user && /^[a-zA-Z0-9-]{1,39}$/.test(String(user.login || user.name || ''));
    });
    if (!valid.length) return false;

    var displayUsers = valid.slice(0, 100);
    track.replaceChildren();

    var first = document.createElement('div');
    first.className = 'contributors-track__group';
    first.setAttribute('data-contributor-group', '');
    displayUsers.forEach(function(user) {
      var person = makePerson(user, false);
      if (person) first.appendChild(person);
    });

    var second = document.createElement('div');
    second.className = 'contributors-track__group';
    second.setAttribute('aria-hidden', 'true');
    displayUsers.forEach(function(user) {
      var person = makePerson(user, true);
      if (person) second.appendChild(person);
    });
    track.appendChild(first);
    track.appendChild(second);

    count.textContent = valid.length.toLocaleString() + (valid.length === 1 ? ' person' : ' people');
    status.textContent = sourceLabel;
    track.style.animationDuration = Math.max(34, Math.min(76, displayUsers.length * 3.1)) + 's';
    return true;
  }

  // Render cached live data immediately, or show a clearly labelled README team fallback.
  var cachedUsers = safeReadCache();
  if (cachedUsers) {
    render(cachedUsers, 'GITHUB + COMMUNITY CONTRIBUTORS · CACHED');
  } else {
    render(mergeContributors(coreTeam), 'PROJECT + COMMUNITY CONTRIBUTORS');
  }

  // Refresh from GitHub. The API is public and no token or sign-in is needed.
  if (!window.fetch) return;
  fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
    .then(function(response) {
      if (!response.ok) throw new Error('GitHub API returned ' + response.status);
      return response.json();
    })
    .then(function(users) {
      if (!Array.isArray(users)) throw new Error('Unexpected GitHub response');
      var usable = mergeContributors(users.filter(function(user) { return user && user.login; }));
      if (render(usable, 'GITHUB + COMMUNITY CONTRIBUTORS · LIVE')) safeWriteCache(usable);
    })
    .catch(function() {
      if (!cachedUsers) status.textContent = 'PROJECT + COMMUNITY CONTRIBUTORS · LIVE ROSTER UNAVAILABLE';
    });
})();


/* Custom video loading overlay removed: YouTube handles its own buffering UI. */

/* ========================================================================
   MANUAL NORMAL-USER CONTRIBUTORS
   GitHub: { login: 'username', label: 'Bug reporter' }
   No GitHub: { name: 'Display Name', avatar_url: 'assets/contributors/name.png',
                url: 'https://example.com/profile', label: 'Helpful suggestion' }
   For non-GitHub users, `url` is optional; omit it for a non-clickable card.
   ======================================================================== */
(function renderNormalUserContributors() {
  'use strict';
  var grid = document.querySelector('[data-normal-contributors-grid]');
  var count = document.querySelector('[data-normal-contributors-count]');
  if (!grid) return;

  // ADD / EDIT NORMAL CONTRIBUTORS HERE:
  var normalUserContributors = [
    // this explain how to add a nor-user
    // GitHub account:
    // { login: 'github-username', label: 'Bug reporter' },
    // No GitHub account:
    // { name: 'Alex', avatar_url: 'assets/contributors/alex.png', label: 'Helpful suggestion' }
    {
  name: 'KING_GAMING734',
  avatar_url: 'assets/contributors/nor-usr/KING_GAMING734.jpg',
  url: '',
  label: 'Helped To Find Bug'
}
  ];

  function addCard(user) {
    if (!user) return;
    var login = String(user.login || '').trim();
    var name = String(user.name || login).trim();
    if (!name) return;

    var card = document.createElement(login || user.url ? 'a' : 'div');
    card.className = 'normal-contributor-card';
    if (login) {
      card.href = 'https://github.com/' + encodeURIComponent(login);
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    } else if (user.url) {
      card.href = user.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    var avatarWrap = document.createElement('span');
    avatarWrap.className = 'normal-contributor-avatar';
    var avatar = document.createElement('img');
    avatar.alt = '';
    avatar.loading = 'lazy';
    avatar.decoding = 'async';
    avatar.src = user.avatar_url || (login ? 'https://github.com/' + encodeURIComponent(login) + '.png?size=160' : '');
    avatar.onerror = function() {
      avatar.remove();
      avatarWrap.textContent = name.charAt(0).toUpperCase();
      avatarWrap.classList.add('normal-contributor-avatar--fallback');
    };
    if (avatar.src) avatarWrap.appendChild(avatar);
    else {
      avatarWrap.textContent = name.charAt(0).toUpperCase();
      avatarWrap.classList.add('normal-contributor-avatar--fallback');
    }

    var title = document.createElement('span');
    title.className = 'normal-contributor-name';
    title.textContent = name;
    var label = document.createElement('span');
    label.className = 'normal-contributor-label';
    label.textContent = user.label || 'Community contributor';
    card.appendChild(avatarWrap);
    card.appendChild(title);
    card.appendChild(label);
    grid.appendChild(card);
  }

  normalUserContributors.forEach(addCard);
  if (count) count.textContent = normalUserContributors.length +
    (normalUserContributors.length === 1 ? ' contributor' : ' contributors');
  if (!normalUserContributors.length) {
    var empty = grid.querySelector('.normal-contributors-empty');
    if (empty) empty.hidden = false;
  }
})();


/* Slide-to-download: resolves the latest APK from the public GitHub release. */
(function () {
  'use strict';
  var slider = document.getElementById('downloadSlider');
  var thumb = document.getElementById('downloadSliderThumb');
  var label = document.getElementById('downloadSliderLabel');
  var status = document.getElementById('downloadSliderStatus');
  if (!slider || !thumb || !label || !status) return;

  var dragging = false;
  var completed = false;
  var startX = 0;
  var currentX = 0;
  var maxX = 0;

  function measure() {
    maxX = Math.max(0, slider.clientWidth - thumb.offsetWidth - 10);
  }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  function setProgress(value) {
    currentX = Math.max(0, Math.min(maxX, value));
    var percent = maxX ? Math.round(currentX / maxX * 100) : 0;
    thumb.style.transform = 'translateX(' + currentX + 'px)';
    slider.style.setProperty('--download-progress', percent + '%');
    thumb.setAttribute('aria-valuenow', String(percent));
    return percent;
  }

  function reset() {
    dragging = false;
    slider.dataset.dragging = 'false';
    setProgress(0);
    slider.dataset.state = 'ready';
    label.textContent = 'Slide to Download';
  }

  function start(event) {
    if (completed || slider.dataset.state === 'loading') return;
    measure();
    dragging = true;
    slider.dataset.dragging = 'true';
    startX = event.clientX - currentX;
    thumb.setPointerCapture(event.pointerId);
    label.textContent = 'Keep sliding…';
    event.preventDefault();
  }

  function move(event) {
    if (!dragging) return;
    var percent = setProgress(event.clientX - startX);
    if (percent >= 96) {
      dragging = false;
      slider.dataset.dragging = 'false';
      completed = true;
      slider.dataset.state = 'loading';
      label.textContent = 'Preparing download…';
      status.textContent = 'Finding the latest APK release…';
      beginDownload();
    }
  }

  function end() {
    if (!dragging) return;
    dragging = false;
    slider.dataset.dragging = 'false';
    if (currentX < maxX * .96) {
      reset();
      status.textContent = '';
    }
  }

  async function beginDownload() {
    try {
      var response = await fetch(
        'https://api.github.com/repos/xodiosx/XoDos-Ark/releases/latest',
        { headers: { 'Accept': 'application/vnd.github+json' } }
      );
      if (!response.ok) throw new Error('GitHub release lookup failed (' + response.status + ').');
      var release = await response.json();
      var apk = (release.assets || []).find(function (asset) {
        return /\.apk$/i.test(asset.name || '');
      });
      if (!apk || !apk.browser_download_url) {
        throw new Error('No APK asset was found in the latest release.');
      }

      var link = document.createElement('a');
      link.href = apk.browser_download_url;
      link.setAttribute('download', apk.name);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();

      slider.dataset.state = 'done';
      label.textContent = 'Download Started';
      status.textContent = 'Your APK download should begin shortly.';
    } catch (error) {
      completed = false;
      slider.dataset.state = 'error';
      label.textContent = 'Try Again';
      status.textContent = (error && error.message ? error.message : 'Download could not start.') +
        ' You can also use the GitHub Releases page.';
      var fallback = document.createElement('a');
      fallback.href = 'https://github.com/xodiosx/XoDos-Ark/releases';
      fallback.target = '_blank';
      fallback.rel = 'noopener';
      fallback.textContent = ' Open releases';
      status.appendChild(fallback);
      resetAfterError = true;
    }
  }

  var resetAfterError = false;
  thumb.addEventListener('pointerdown', start);
  thumb.addEventListener('pointermove', move);
  thumb.addEventListener('pointerup', end);
  thumb.addEventListener('pointercancel', end);
  thumb.addEventListener('lostpointercapture', function () {
    if (dragging) end();
  });
  thumb.addEventListener('click', function () {
    if (resetAfterError) {
      resetAfterError = false;
      status.textContent = '';
      reset();
    }
  });
  thumb.addEventListener('keydown', function (event) {
    if (completed || slider.dataset.state === 'loading') return;
    if (event.key === 'ArrowRight' || event.key === 'End') {
      event.preventDefault();
      var next = event.key === 'End' ? maxX : currentX + Math.max(12, maxX * .08);
      if (setProgress(next) >= 96) {
        completed = true;
        slider.dataset.state = 'loading';
        label.textContent = 'Preparing download…';
        status.textContent = 'Finding the latest APK release…';
        beginDownload();
      }
    } else if (event.key === 'Home' || event.key === 'ArrowLeft') {
      event.preventDefault();
      reset();
    }
  });
})();
/* ===== LAZY YOUTUBE EMBEDS =====
   Set data-youtube-id on a video iframe to activate that page's YouTube video.
   The iframe remains blank until its native lazy-loading threshold is reached.
*/
(function initLazyYouTubeEmbeds() {
  'use strict';
  function activateYouTubeEmbeds() {
    var frames = document.querySelectorAll('iframe[data-youtube-id]');
    frames.forEach(function(frame) {
      var id = (frame.getAttribute('data-youtube-id') || '').trim();
      if (!id || id === 'PASTE_YOUTUBE_VIDEO_ID_HERE') return;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      if (frame.getAttribute('src') === 'about:blank') {
        frame.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateYouTubeEmbeds, { once: true });
  } else {
    activateYouTubeEmbeds();
  }
})();
