(function () {
  // Render GitHub repos
  const listEl = document.querySelector('.projects-section .project-list');
  if (listEl) {
    listEl.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';

    const username = 'Rajbharti06';
    const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

    fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(resp => {
        if (!resp.ok) throw new Error('GitHub API error: ' + resp.status);
        return resp.json();
      })
      .then(repos => {
        if (!Array.isArray(repos)) throw new Error('Unexpected response');
        const exclude = new Set(['Rajbharti06', 'skills-introduction-to-github']);
        const filtered = repos
          .filter(r => !r.archived && !exclude.has(r.name));

        const projectPriority = [
          'rajbharti.in',
          'mymitra',
          'intervai',
          'jarviscoder',
          'apoclypsgpt',
          'apocalypsegpt',
          'appoclypsegpt'
        ];
        function priorityIndex(repo) {
          const n = normalizeName(repo.name || '');
          const idx = projectPriority.indexOf(n);
          return idx === -1 ? Number.POSITIVE_INFINITY : idx;
        }
        filtered.sort((a, b) => {
          const ai = priorityIndex(a);
          const bi = priorityIndex(b);
          if (ai !== bi) return ai - bi;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });

        const fragment = document.createDocumentFragment();
        filtered.forEach(repo => {
          const article = document.createElement('article');
          article.className = 'project';
          const description = repo.description || 'No description provided.';
          const language = repo.language || 'Misc';
          const techTags = [language, `★ ${repo.stargazers_count || 0}`];
          if (repo.fork) techTags.push('Fork');
          const tagsHtml = techTags.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');

          article.innerHTML = `
            <h3>${escapeHtml(repo.name)}</h3>
            <p>${escapeHtml(description)}</p>
            <div class="project-tech">${tagsHtml}</div>
            <div class="project-links">
              <a href="${repo.html_url}" class="btn secondary" role="button" target="_blank" rel="noopener">View Code</a>
            </div>
          `;
          fragment.appendChild(article);
        });

        listEl.innerHTML = '';
        listEl.appendChild(fragment);

        if (filtered.length === 0) {
          listEl.innerHTML = '<p>No public projects found on GitHub.</p>';
        }
      })
      .catch(err => {
        console.error('Failed to load GitHub projects:', err);
        listEl.innerHTML = '<p class="error">Failed to load projects from GitHub. Please try again later.</p>';
      });
  }

  // Render Blogs from /blog/index.json
  const blogListEl = document.querySelector('.blogs-section .blog-list');
  if (blogListEl) {
    blogListEl.innerHTML = '<div class="loading">Loading blogs...</div>';
    fetch('./blog/index.json')
      .then(resp => {
        if (!resp.ok) throw new Error('Missing blog/index.json');
        return resp.json();
      })
      .then(posts => {
        if (!Array.isArray(posts)) throw new Error('Invalid blog index');
        // sort by explicit order if present, otherwise by date desc
        posts.sort((a, b) => {
          const ao = (typeof a.order === 'number') ? a.order : Infinity;
          const bo = (typeof b.order === 'number') ? b.order : Infinity;
          if (ao !== bo) return ao - bo;
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
        const frag = document.createDocumentFragment();
        posts.forEach(p => {
          const article = document.createElement('article');
          article.className = 'blog-card';
          const title = p.title || 'Untitled';
          const date = p.date ? new Date(p.date).toLocaleDateString() : '';
          const excerpt = p.excerpt || '';
          const slug = p.slug || '';
          const href = p.url ? p.url : (slug ? `blog/${slug}.html` : '#');
          article.innerHTML = `
            <h3 class="blog-title">${escapeHtml(title)}</h3>
            <p class="blog-meta">${date ? escapeHtml(date) : ''}</p>
            <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
            <div class="blog-actions">
              <a href="${escapeAttr(href)}" class="btn secondary" role="button">Read More</a>
            </div>
          `;
          frag.appendChild(article);
        });
        blogListEl.innerHTML = '';
        blogListEl.appendChild(frag);
        if (posts.length === 0) blogListEl.innerHTML = '<p>No blogs yet.</p>';
      })
      .catch(err => {
        console.error('Failed to load blogs:', err);
        blogListEl.innerHTML = '<p class="error">Failed to load blogs. Create blog/index.json.</p>';
      });
  }

  // (removed) CV-related request button logic

  // Render Certifications from JSON in assets
  const certGrid = document.querySelector('#certifications .cert-grid');
  if (certGrid) {
    certGrid.innerHTML = '<div class="loading">Loading certifications...</div>';
    const certSection = document.querySelector('#certifications');
    let allCerts = [];
    let sortDir = 'asc';
    let searchQuery = '';
    
    // Debug: Log the fetch attempt
    console.log('Attempting to fetch certifications.json');
    
    function loadCerts() {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const url = './assets/certifications.json';
      const isFile = (typeof location !== 'undefined' && location.protocol === 'file:');
      console.log('Attempting to fetch certifications.json from', url, 'protocol =', location.protocol);
      return fetch(url, { signal: controller.signal })
        .then(resp => {
          clearTimeout(timer);
          console.log('Certification fetch response:', resp.status);
          if (!resp.ok) throw new Error('Missing certifications.json (HTTP ' + resp.status + ')');
          return resp.json();
        })
        .then(items => {
          console.log('Certifications loaded:', items);
          if (!Array.isArray(items)) throw new Error('Invalid certifications.json: expected an array');
          const valid = items.filter(validateCertItem);
          const skipped = items.length - valid.length;
          if (skipped > 0) console.warn('Skipped', skipped, 'invalid certification entries');
          allCerts = valid;
          ensureToolbar(certSection);
          renderCerts();
        })
        .catch(err => {
          clearTimeout(timer);
          console.error('Failed to load certifications:', err);
          const hint = isFile
            ? 'Open this site via a local server instead of file:// to allow fetching JSON.'
            : 'Check that assets/certifications.json exists and is publicly accessible.';
          certGrid.innerHTML = `
            <div class="error">
              <p>Failed to load certifications.</p>
              <p>${escapeHtml(err.message || String(err))}</p>
              <p>${escapeHtml(hint)}</p>
              <div style="margin-top:0.75rem">
                <button class="btn" id="retry-certs">Retry</button>
              </div>
            </div>`;
          const retryBtn = document.getElementById('retry-certs');
          if (retryBtn) retryBtn.addEventListener('click', () => {
            certGrid.innerHTML = '<div class="loading">Loading certifications...</div>';
            loadCerts();
          });
        });
    }
    loadCerts();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }
  function normalizeName(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function parseCertDate(str) {
    if (!str) return 0;
    const s = String(str).trim();
    const m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s*(\d{4})/);
    if (m) {
      const day = parseInt(m[1], 10) || 1;
      const monName = m[2].toLowerCase();
      const year = parseInt(m[3], 10) || 0;
      const months = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
      const mon = months[monName];
      if (mon !== undefined) return new Date(year, mon, day).getTime();
    }
    const t = Date.parse(s.replace(/(\d{1,2})(st|nd|rd|th)/, '$1'));
    return isNaN(t) ? 0 : t;
  }
  function parseMonthIndex(str) {
    if (!str) return -1;
    const s = String(str).toLowerCase();
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    for (let i = 0; i < months.length; i++) {
      if (s.includes(months[i])) return i;
    }
    const t = parseCertDate(str);
    if (!t) return -1;
    return new Date(t).getMonth();
  }
  function monthLabel(i) {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][i] || '';
  }
  function ensureToolbar(section) {
    if (!section) return;
    let toolbar = section.querySelector('.cert-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'cert-toolbar';
      const search = document.createElement('input');
      search.type = 'search';
      search.placeholder = 'Search certificates';
      search.addEventListener('input', () => { searchQuery = search.value.trim().toLowerCase(); renderCerts(); });
      const sortSel = document.createElement('select');
      sortSel.innerHTML = '<option value="asc">Date ↑</option><option value="desc">Date ↓</option>';
      sortSel.addEventListener('change', () => { sortDir = sortSel.value; renderCerts(); });
      const statusSel = document.createElement('select');
      statusSel.innerHTML = '<option value="">All Statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="expired">Expired</option>';
      statusSel.addEventListener('change', () => { searchQuery = statusSel.value ? statusSel.value.toLowerCase() : ''; renderCerts(); });
      toolbar.appendChild(search);
      toolbar.appendChild(sortSel);
      toolbar.appendChild(statusSel);
      section.insertBefore(toolbar, certGrid);
    }
  }
  function renderCerts() {
    if (!Array.isArray(allCerts)) return;
    const byMonth = Array.from({ length: 12 }, () => []);
    const unspecified = [];
    allCerts.forEach(item => {
      const mi = parseMonthIndex(item.date || '');
      if (mi >= 0) byMonth[mi].push(item); else unspecified.push(item);
    });
    certGrid.innerHTML = '';
    for (let mi = 0; mi < 12; mi++) {
      const list = byMonth[mi]
        .filter(it => filterMatch(it))
        .sort((a, b) => {
          const da = parseCertDate(a.date);
          const db = parseCertDate(b.date);
          return sortDir === 'asc' ? da - db : db - da;
        });
      if (list.length === 0) continue;
      const monthEl = document.createElement('section');
      monthEl.className = 'cert-month';
      const header = document.createElement('div');
      header.className = 'month-header';
      header.innerHTML = `<span class="month-title">${monthLabel(mi)}</span><span class="month-count">${list.length}</span>`;
      const group = document.createElement('div');
      group.className = 'month-group';
      list.forEach(item => group.appendChild(certCard(item)));
      monthEl.appendChild(header);
      monthEl.appendChild(group);
      certGrid.appendChild(monthEl);
    }
    if (unspecified.length) {
      const list = unspecified
        .filter(it => filterMatch(it))
        .sort((a, b) => {
          const da = parseCertDate(a.date);
          const db = parseCertDate(b.date);
          return sortDir === 'asc' ? da - db : db - da;
        });
      if (list.length) {
        const monthEl = document.createElement('section');
        monthEl.className = 'cert-month';
        const header = document.createElement('div');
        header.className = 'month-header';
        header.innerHTML = `<span class="month-title">Unspecified</span><span class="month-count">${list.length}</span>`;
        const group = document.createElement('div');
        group.className = 'month-group';
        list.forEach(item => group.appendChild(certCard(item)));
        monthEl.appendChild(header);
        monthEl.appendChild(group);
        certGrid.appendChild(monthEl);
      }
    }
    if (!certGrid.children.length) {
      certGrid.innerHTML = '<p class="error">No certificates found.</p>';
    }
  }
  function filterMatch(item) {
    if (!searchQuery) return true;
    const hay = [item.title, item.issuer, item.date]
      .concat(Array.isArray(item.badges) ? item.badges : [])
      .concat(item.status ? [item.status] : [])
      .join(' ').toLowerCase();
    return hay.includes(searchQuery);
  }
  function certCard(item) {
    const card = document.createElement('article');
    card.className = 'cert-card';
    const imgSrc = item.image || '';
    const title = item.title || 'Certification';
    const issuer = item.issuer || '';
    const date = item.date || '';
    const pdf = item.pdf_url || '';
    const verify = item.verify_url || '';
    const badges = Array.isArray(item.badges) ? item.badges : [];
    const badgeHtml = badges.map(b => `<span class="badge-chip">${escapeHtml(b)}</span>`).join('');
    const viewHref = imgSrc || pdf || verify || '';
    const status = (item.status || 'completed').toLowerCase();
    const statusCls = status === 'pending' ? 'status-pending' : status === 'expired' ? 'status-expired' : 'status-completed';
    const statusHtml = `<span class="status-badge ${statusCls}"><span class="dot"></span><span>${escapeHtml(capitalize(status))}</span></span>`;
    card.innerHTML = `
      <div class="cert-image">
        ${imgSrc ? `<a href="${escapeAttr(pdf || imgSrc || verify || imgSrc)}" target="_blank" rel="noopener noreferrer nofollow" referrerpolicy="no-referrer"><img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(title)} certificate" loading="lazy"/></a>` : ''}
      </div>
      <div class="cert-body">
        <h3 class="cert-title">${escapeHtml(title)}</h3>
        <p class="cert-meta">${escapeHtml(issuer)} ${date ? '• ' + escapeHtml(date) : ''}</p>
        ${statusHtml}
        <div class="cert-badges">${badgeHtml}</div>
        <div class="cert-actions">
          ${viewHref ? `<a href="${escapeAttr(viewHref)}" class="btn" target="_blank" rel="noopener noreferrer nofollow" referrerpolicy="no-referrer">View</a>` : ''}
        </div>
      </div>
    `;
    return card;
  }
  function validateCertItem(item) {
    if (!item || typeof item !== 'object') return false;
    const title = item.title;
    const issuer = item.issuer;
    const date = item.date;
    if (typeof title !== 'string' || typeof issuer !== 'string' || typeof date !== 'string') {
      console.warn('Invalid cert item:', item);
      return false;
    }
    return true;
  }
  function capitalize(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }
  // Reveal on scroll animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => observer.observe(el));
  }
})();
