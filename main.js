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

    var shell = document.createElement('span');
    shell.className = 'contributors-avatar-shell';
    var avatar = document.createElement('img');
    var apiAvatar = typeof user.avatar_url === 'string' && (/^https:\/\/avatars\.githubusercontent\.com\//.test(user.avatar_url) || /^assets\/contributors\/[a-zA-Z0-9._-]+$/.test(user.avatar_url))
      ? user.avatar_url
      : 'https://github.com/' + encodeURIComponent(login) + '.png?size=160';
    avatar.src = apiAvatar;
    avatar.alt = '';
    avatar.loading = 'lazy';
    avatar.decoding = 'async';
    avatar.referrerPolicy = 'no-referrer';
    avatar.addEventListener('error', function() {
      var fallback = document.createElement('span');
      fallback.className = 'contributors-avatar-fallback';
      fallback.textContent = displayName.slice(0, 2).toUpperCase();
      shell.replaceChildren(fallback);
    }, { once: true });
    shell.appendChild(avatar);
    link.appendChild(shell);

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
