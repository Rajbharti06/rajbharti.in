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
        filtered.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

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
        // sort by date desc if provided
        posts.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
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
    
    // Debug: Log the fetch attempt
    console.log('Attempting to fetch certifications.json');
    
    fetch('./assets/certifications.json')
      .then(resp => {
        console.log('Certification fetch response:', resp.status);
        if (!resp.ok) throw new Error('Missing certifications.json');
        return resp.json();
      })
      .then(items => {
        console.log('Certifications loaded:', items);
        if (!Array.isArray(items)) throw new Error('Invalid certifications.json');
        const frag = document.createDocumentFragment();
        items.forEach(item => {
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

          card.innerHTML = `
            <div class="cert-image">
              ${imgSrc ? `<a href="${escapeAttr(pdf || imgSrc || verify || imgSrc)}" target="_blank" rel="noopener noreferrer nofollow" referrerpolicy="no-referrer"><img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(title)} certificate" loading="lazy"/></a>` : ''}
            </div>
            <div class="cert-body">
              <h3 class="cert-title">${escapeHtml(title)}</h3>
              <p class="cert-meta">${escapeHtml(issuer)} ${date ? '• ' + escapeHtml(date) : ''}</p>
              <div class="cert-badges">${badgeHtml}</div>
              <div class="cert-actions">
                ${viewHref ? `<a href="${escapeAttr(viewHref)}" class="btn" target="_blank" rel="noopener noreferrer nofollow" referrerpolicy="no-referrer">View</a>` : ''}
              </div>
            </div>
          `;
          frag.appendChild(card);
        });
        certGrid.innerHTML = '';
        certGrid.appendChild(frag);
      })
      .catch(err => {
        console.error('Failed to load certifications:', err);
        certGrid.innerHTML = '<p class="error">Failed to load certifications. Please check the console for details.</p>';
      });
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