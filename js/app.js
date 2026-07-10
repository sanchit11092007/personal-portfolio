(() => {
  "use strict";

  const DATA = window.PORTFOLIO_DATA || {};
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    certificateFilter: "other",
    projectFilter: "data-science"
  };

  document.documentElement.classList.add("js");

  let preloaderFinished = false;
  const skipPreloader = new URLSearchParams(window.location.search).has("skip-preloader");
  const finishPreloader = () => {
    if (preloaderFinished) return;
    preloaderFinished = true;
    document.body.classList.add("is-loaded");
    const preloader = $("#preloader");
    if (preloader) {
      preloader.style.opacity = "0";
      preloader.style.visibility = "hidden";
      preloader.style.pointerEvents = "none";
      if (skipPreloader) preloader.setAttribute("hidden", "");
      else window.setTimeout(() => preloader.setAttribute("hidden", ""), 700);
    }
  };

  document.addEventListener("DOMContentLoaded", () => window.setTimeout(finishPreloader, 900), { once: true });
  window.addEventListener("load", () => window.setTimeout(finishPreloader, 360), { once: true });
  window.setTimeout(finishPreloader, 2600);
  if (skipPreloader) finishPreloader();

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function externalLink(url, label, className) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.className = className || "";
    anchor.textContent = label;
    return anchor;
  }

  function renderSocialLinks() {
    const container = $("#socialDashboard");
    if (!container || !Array.isArray(DATA.socialLinks)) return;

    const fragment = document.createDocumentFragment();
    DATA.socialLinks.forEach((link) => {
      const anchor = externalLink(link.url, "", "social-link");
      anchor.dataset.tone = link.tone || "neutral";
      if (link.priority) anchor.dataset.priority = "high";
      anchor.dataset.tooltip = link.label;
      anchor.setAttribute("aria-label", link.label);
      anchor.setAttribute("title", link.label);
      anchor.innerHTML = `
        <svg class="social-icon" role="img" aria-hidden="true" viewBox="0 0 24 24">
          <title>${escapeHTML(link.label)}</title>
          <use href="#icon-${escapeHTML(link.icon || link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"></use>
        </svg>
        <span class="sr-only">${escapeHTML(link.label)}</span>
      `;
      fragment.appendChild(anchor);
    });
    container.replaceChildren(fragment);
  }

  function renderSkills() {
    if (!Array.isArray(DATA.skills)) return;

    // Create a map of skill name to proficiency
    const skillMap = new Map();
    DATA.skills.forEach(category => {
      if (Array.isArray(category.items)) {
        category.items.forEach(item => {
          if (typeof item === 'object' && item.name) {
            skillMap.set(item.name.toLowerCase().trim(), item.proficiency);
          } else if (typeof item === 'string') {
            skillMap.set(item.toLowerCase().trim(), 10); // default
          }
        });
      }
    });

    // Update existing DOM elements
    const allSkillRows = $$(".skill-row");
    allSkillRows.forEach(row => {
      const nameEl = $(".skill-name", row);
      const valEl = $(".progress-value", row);
      const fillEl = $(".progress-fill", row);
      
      if (nameEl && fillEl) {
        const name = nameEl.textContent.trim().toLowerCase();
        let prof = skillMap.get(name);
        
        // Handle variations (e.g. "Data Structures & Algorithms" vs "Data Structures")
        if (prof === undefined) {
           for (const [key, val] of skillMap.entries()) {
             if (name.includes(key) || key.includes(name)) {
               prof = val;
               break;
             }
           }
        }
        
        if (prof !== undefined) {
           fillEl.dataset.progress = String(prof);
           if (valEl) {
             valEl.dataset.target = String(prof);
             valEl.textContent = prof + "%";
           }
        }
      }
    });
  }

  function renderFilters(containerSelector, categories, active, onSelect, showAll = true) {
    const container = $(containerSelector);
    if (!container) return;

    const fragment = document.createDocumentFragment();
    if (showAll) {
      const allButton = createFilterButton("all", "All", active === "all", onSelect);
      fragment.append(allButton);
    }
    categories.forEach((category) => {
      fragment.append(createFilterButton(category.id, category.title, active === category.id, onSelect));
    });
    container.replaceChildren(fragment);
  }

  function createFilterButton(id, label, isActive, onSelect) {
    const button = createElement("button", "filter-button", label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(isActive));
    button.addEventListener("click", () => onSelect(id));
    return button;
  }

  function renderProjects() {
    const categories = DATA.projectCategories || [];
    if (!categories.length) return;

    if (!state.projectFilter || !categories.some(c => c.id === state.projectFilter)) {
      state.projectFilter = categories[0].id;
    }

    // Render category tabs
    const tabsContainer = $("#projectTabs");
    if (tabsContainer) {
      const fragment = document.createDocumentFragment();
      categories.forEach((cat) => {
        const btn = createElement("button", "project-tab-btn" + (cat.id === state.projectFilter ? " is-active" : ""), "");
        btn.type = "button";
        btn.setAttribute("aria-pressed", String(cat.id === state.projectFilter));
        btn.dataset.category = cat.id;
        btn.innerHTML = `<i class="${cat.icon || "fa-solid fa-folder"}" aria-hidden="true"></i><span>${escapeHTML(cat.title)}</span>`;
        btn.addEventListener("click", () => {
          state.projectFilter = cat.id;
          renderProjects();
        });
        fragment.append(btn);
      });
      tabsContainer.replaceChildren(fragment);
    }

    // Render projects for active category
    const container = $("#projectGrid");
    if (!container) return;

    const activeCategory = state.projectFilter;
    const allProjects = DATA.projects || [];
    const filtered = allProjects.filter(p => p.category === activeCategory);

    const fragment = document.createDocumentFragment();

    if (activeCategory === "future") {
      fragment.append(createFutureProjectsPanel());
    } else if (filtered.length) {
      filtered.forEach((project) => fragment.append(createProjectCard(project)));
    } else {
      fragment.append(createProjectEmptyState(activeCategory));
    }

    container.replaceChildren(fragment);
    observeReveals();
  }

  function createProjectCard(project) {
    const card = createElement("article", "project-card-new reveal");

    // Dynamic Category Badge lookup
    const catInfo = (DATA.projectCategories || []).find((cat) => cat.id === project.category) || {
      title: "Project",
      icon: "fa-solid fa-folder"
    };

    // Image wrapper with premium overlay
    const imgWrap = createElement("div", "project-img-wrap");
    const image = new Image();
    image.className = "project-image-new";
    image.src = project.image || "assets/hero-ai-lab.png";
    image.alt = project.title ? `${project.title} preview` : "Project preview";
    image.loading = "lazy";
    const imgOverlay = createElement("div", "project-img-overlay");
    imgWrap.append(image, imgOverlay);

    // Body
    const body = createElement("div", "project-body-new");

    // Category badge with icon
    const catBadge = createElement("span", "project-cat-badge");
    catBadge.innerHTML = `<i class="${catInfo.icon || "fa-solid fa-folder"}" aria-hidden="true"></i><span>${catInfo.title}</span>`;
    body.append(catBadge);

    // Title
    body.append(createElement("h3", "project-title-new", project.title || "Project"));

    // Description
    body.append(createElement("p", "project-desc-new", project.description || ""));

    // Features
    if (project.features && project.features.length) {
      const featSection = createElement("div", "project-features");
      const featTitle = createElement("span", "project-features-label", "Key Modules & Deliverables");
      const featList = createElement("ul", "project-features-list");
      project.features.slice(0, 4).forEach(feat => {
        const li = createElement("li", "", feat);
        featList.append(li);
      });
      featSection.append(featTitle, featList);
      body.append(featSection);
    }

    // Tech stack
    if (project.techStack && project.techStack.length) {
      const stack = createElement("div", "project-stack-new");
      project.techStack.forEach((tech) => stack.append(createElement("span", "project-tech-badge", tech)));
      body.append(stack);
    }

    // Actions
    const actions = createElement("div", "project-actions-new");
    if (project.codeUrl) {
      const codeBtn = externalLink(project.codeUrl, "", "btn-project-code");
      codeBtn.innerHTML = `<i class="fa-brands fa-github" aria-hidden="true"></i><span>View Source</span>`;
      actions.append(codeBtn);
    }
    if (project.demoUrl) {
      const demoBtn = externalLink(project.demoUrl, "", "btn-project-demo");
      demoBtn.innerHTML = `<span>Live Demo</span><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>`;
      actions.append(demoBtn);
    }
    body.append(actions);

    card.append(imgWrap, body);
    return card;
  }

  function createProjectEmptyState(categoryId) {
    const labels = {
      "ai-ml": { icon: "fa-solid fa-brain", title: "AI & Machine Learning Projects", msg: "Projects in machine learning, deep learning, NLP, and intelligent systems are actively being developed." },
      "programming": { icon: "fa-solid fa-code", title: "Programming Projects", msg: "Software development projects covering algorithms, APIs, and full-stack solutions are in progress." },
    };
    const cfg = labels[categoryId] || { icon: "fa-solid fa-folder-open", title: "No Projects Yet", msg: "Projects in this category will be added soon." };

    const el = createElement("div", "project-empty-state reveal");
    el.innerHTML = `
      <div class="project-empty-icon"><i class="${cfg.icon}"></i></div>
      <h3>${cfg.title}</h3>
      <p>${cfg.msg}</p>
      <span class="status-badge pulse-badge">Coming Soon</span>
    `;
    return el;
  }

  function createFutureProjectsPanel() {
    const areas = DATA.plannedProjectAreas || [];
    const el = createElement("div", "project-future-panel reveal");
    el.innerHTML = `
      <div class="project-future-header">
        <div class="project-future-icon"><i class="fa-solid fa-rocket"></i></div>
        <div>
          <h3>Future AI & Data Science Projects</h3>
          <p>Actively building foundations across advanced machine learning, deep learning, and AI research domains. These areas represent the next phase of development.</p>
        </div>
        <span class="status-badge pulse-badge">Actively Planning</span>
      </div>
      <div class="project-future-areas">
        ${areas.map(a => `<span class="project-future-badge"><i class="fa-solid fa-arrow-right"></i>${escapeHTML(a)}</span>`).join("")}
      </div>
    `;
    return el;
  }

  function renderCertificates() {
    const categories = DATA.certificationCategories || [];
    if (!categories.length) return;

    if (!state.certificateFilter || !categories.some(c => c.id === state.certificateFilter)) {
      state.certificateFilter = categories[0].id;
    }

    renderFilters("#certificateFilters", categories, state.certificateFilter, (id) => {
      state.certificateFilter = id;
      renderCertificates();
    }, false);

    const container = $("#certificateGrid");
    if (!container) return;

    const activeCategory = state.certificateFilter;
    const certificates = (DATA.certifications || []).filter(
      (cert) => cert.category === activeCategory
    );

    const fragment = document.createDocumentFragment();
    if (certificates.length) {
      certificates.forEach((cert) => fragment.append(createCertificateCard(cert)));
    } else {
      fragment.append(createCertificatePlaceholder(activeCategory));
    }

    container.replaceChildren(fragment);
    observeReveals();
  }

  function createCertificatePlaceholder(categoryId) {
    const card = createElement("article", "certificate-placeholder-card glass-card reveal");
    
    let iconClass = "fa-solid fa-award";
    let statusText = "In Progress";
    let description = "Relevant certifications are being collected and will appear here as learning milestones are completed.";

    if (categoryId === "ml-ai") {
      iconClass = "fa-solid fa-brain";
      statusText = "Currently Pursuing";
      description = "I am currently building a strong foundation in Artificial Intelligence, Machine Learning, Deep Learning, and modern AI technologies. Relevant certifications will be showcased here upon completion.";
    } else if (categoryId === "data-science") {
      iconClass = "fa-solid fa-chart-line";
      statusText = "In Progress";
      description = "My Data Science learning journey is actively underway. Certifications covering analytics, statistics, visualization, and predictive modeling will be added here as they are completed.";
    } else if (categoryId === "development") {
      iconClass = "fa-solid fa-laptop-code";
      statusText = "Learning Phase";
      description = "I am continuously improving my programming and software development skills through structured learning and hands-on practice. Completed certifications will be displayed here as milestones are achieved.";
    } else {
      iconClass = "fa-solid fa-award";
      statusText = "Exploring";
      description = "Foundational learning certifications, technical training, and other academic milestones will be displayed here as they are earned.";
    }

    card.innerHTML = `
      <div class="placeholder-icon-wrap">
        <i class="${iconClass}"></i>
      </div>
      <div class="placeholder-content">
        <div class="placeholder-header">
          <h3>Certification Journey In Progress</h3>
          <span class="status-badge placeholder-badge pulse-badge">${statusText}</span>
        </div>
        <p>${description}</p>
      </div>
    `;

    return card;
  }

  function getCertificateCategory(categoryId) {
    const category = (DATA.certificationCategories || []).find((item) => item.id === categoryId);
    let icon = "fa-solid fa-award";
    if (categoryId === "ml-ai") icon = "fa-solid fa-brain";
    else if (categoryId === "data-science") icon = "fa-solid fa-chart-line";
    else if (categoryId === "development") icon = "fa-solid fa-laptop-code";
    
    return {
      title: category ? category.title : categoryId,
      icon: icon
    };
  }

  function createCertificateCard(certificate) {
    const card = createElement("article", "certificate-card reveal");
    
    // Framed Certificate Image Container
    const imgWrap = createElement("div", "certificate-img-wrap");
    const image = new Image();
    image.className = "certificate-image";
    image.src = certificate.image || "assets/hero-ai-lab.png";
    image.alt = certificate.name ? `${certificate.name} certificate` : "Certificate image";
    image.loading = "lazy";
    
    const imgOverlay = createElement("div", "certificate-img-overlay");
    imgOverlay.innerHTML = `<span class="cert-quick-badge"><i class="fa-solid fa-expand"></i> Quick View</span>`;
    imgWrap.append(image, imgOverlay);
    
    // Clickable image
    imgWrap.addEventListener("click", () => openCertificate(certificate));
    
    const body = createElement("div", "certificate-body");
    
    // Dynamic Category Badge
    const catInfo = getCertificateCategory(certificate.category);
    const badge = createElement("span", "category-badge");
    badge.innerHTML = `<i class="${catInfo.icon}"></i><span>${catInfo.title}</span>`;
    body.append(badge);
    
    // Certificate Title
    body.append(createElement("h3", "", certificate.name || "Certificate"));
    
    // Structured Metadata Grid
    const metaGrid = createElement("div", "certificate-meta-grid");
    
    const issuerItem = createElement("div", "cert-meta-item");
    issuerItem.innerHTML = `<span class="meta-label">Issuer</span><span class="meta-val"><i class="fa-solid fa-building-columns"></i> ${certificate.issuer || "N/A"}</span>`;
    
    const dateItem = createElement("div", "cert-meta-item");
    dateItem.innerHTML = `<span class="meta-label">Year</span><span class="meta-val"><i class="fa-solid fa-calendar-days"></i> ${certificate.issueDate || "N/A"}</span>`;
    
    metaGrid.append(issuerItem, dateItem);
    
    if (certificate.credentialId) {
      const idItem = createElement("div", "cert-meta-item cert-meta-id-item");
      idItem.innerHTML = `<span class="meta-label">Credential ID</span><span class="meta-val code-val"><i class="fa-solid fa-fingerprint"></i> ${certificate.credentialId}</span>`;
      metaGrid.append(idItem);
    }
    body.append(metaGrid);
    
    // Description
    body.append(createElement("p", "certificate-desc", certificate.description || ""));

    // Skills Tags
    const skills = createElement("div", "certificate-skills");
    (certificate.skills || []).forEach((skill) => skills.append(createElement("span", "", skill)));
    body.append(skills);

    // Actions Footer
    const actions = createElement("div", "certificate-actions-bar");
    
    const previewBtn = createElement("button", "button button-secondary btn-cert-view");
    previewBtn.type = "button";
    previewBtn.innerHTML = `<i class="fa-solid fa-expand"></i><span>View Details</span>`;
    previewBtn.addEventListener("click", () => openCertificate(certificate));
    actions.append(previewBtn);
    
    if (certificate.verificationUrl) {
      const verifyLink = externalLink(certificate.verificationUrl, "", "button button-ghost btn-cert-verify");
      verifyLink.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>Verify</span>`;
      actions.append(verifyLink);
    }
    body.append(actions);

    card.append(imgWrap, body);
    return card;
  }

  function openCertificate(certificate) {
    const dialog = $("#certificateDialog");
    if (!dialog) return;

    $("#certificateDialogImage").src = certificate.image || "";
    $("#certificateDialogImage").alt = certificate.name ? `${certificate.name} certificate preview` : "Certificate preview";
    $("#certificateDialogTitle").textContent = certificate.name || "Certificate";
    
    const issuerEl = $("#certificateDialogIssuer");
    if (issuerEl) issuerEl.textContent = certificate.issuer || "N/A";
    
    const dateEl = $("#certificateDialogDate");
    if (dateEl) dateEl.textContent = certificate.issueDate || "N/A";
    
    const idEl = $("#certificateDialogId");
    if (idEl) idEl.textContent = certificate.credentialId || "N/A";

    const link = $("#certificateDialogLink");
    if (link) {
      link.href = certificate.verificationUrl || "#";
      link.style.display = certificate.verificationUrl ? "inline-flex" : "none";
    }

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }



  function setupNavigation() {
    const toggle = $(".nav-toggle");
    const navLinks = $("#navLinks");
    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("is-nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$("#navLinks a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("is-nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    const sections = $$("main section[id]");
    const navAnchors = new Map($$("#navLinks a").map((anchor) => [anchor.getAttribute("href")?.slice(1), anchor]));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((anchor) => anchor.classList.remove("is-active"));
          navAnchors.get(entry.target.id)?.classList.add("is-active");
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  let revealObserver;

  function observeReveals() {
    const elements = $$(".reveal:not([data-observed])");

    if (prefersReducedMotion) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
        runProgressAnimations(element);
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            runProgressAnimations(entry.target);
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
      );
    }

    elements.forEach((element) => {
      element.dataset.observed = "true";
      revealObserver.observe(element);
    });
  }

  function runProgressAnimations(scope) {
    $$(".skill-row", scope).forEach((row) => {
      const fill = row.querySelector(".progress-fill");
      const label = row.querySelector(".progress-value");
      if (!fill || !label || fill.dataset.animated === "true") return;

      const target = Number(fill.dataset.progress || 0);
      fill.dataset.animated = "true";

      if (prefersReducedMotion) {
        fill.style.width = `${target}%`;
        label.textContent = `${target}%`;
        return;
      }

      // Reset label to 0 before animating
      label.textContent = "0%";

      const duration = 1450;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(progress);
        fill.style.width = `${target * eased}%`;
        label.textContent = `${Math.round(target * eased)}%`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }

  function setupCounters() {
    const counters = $$(".stat-number");
    if (!counters.length) return;

    const animateCounter = (element) => {
      const target = Number(element.dataset.count || 0);
      const suffix = element.dataset.suffix || "";
      const duration = 720;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * easeOutCubic(progress));
        element.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      counters.forEach((counter) => {
        counter.textContent = `${counter.dataset.count || "0"}${counter.dataset.suffix || ""}`;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((counter) => observer.observe(counter));
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function setupTypewriter() {
    const target = $("[data-typewriter]");
    if (!target) return;

    const words = [
      "machine learning foundations",
      "data science workflows",
      "DSA problem solving",
      "AI research habits",
      "production-minded engineering"
    ];

    if (prefersReducedMotion) {
      target.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const word = words[wordIndex];
      target.textContent = word.slice(0, charIndex);

      if (!deleting && charIndex < word.length) {
        charIndex += 1;
        window.setTimeout(type, 58);
        return;
      }

      if (!deleting && charIndex === word.length) {
        deleting = true;
        window.setTimeout(type, 1200);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(type, 32);
        return;
      }

      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      window.setTimeout(type, 260);
    };

    type();
  }

  function setupParticles() {
    const canvas = $("#particle-canvas");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];
    const pointer = { x: 0, y: 0, active: false };
    let animationFrameId;
    let isVisible = true;

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(45, Math.max(15, Math.floor(width / 36)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: Math.random() * 1.2 + 0.4
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 150 && distance > 1) {
            particle.vx -= (dx / distance) * 0.008;
            particle.vy -= (dy / distance) * 0.008;
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.992;
        particle.vy *= 0.992;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fill();

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.05 * (1 - distance / 80)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      if (isVisible) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    resize();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            draw();
          }
        } else {
          isVisible = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        }
      });
    }, { threshold: 0 });
    
    observer.observe(canvas);
  }

  function setupResumeActions() {
    $$("[data-download-resume]").forEach((button) => {
      button.addEventListener("click", downloadResume);
    });

    $("#printResume")?.addEventListener("click", () => {
      document.body.classList.add("print-resume");
      window.print();
      window.setTimeout(() => document.body.classList.remove("print-resume"), 400);
    });
  }

  function downloadResume() {
    const anchor = document.createElement("a");
    anchor.href = "assets/resume/sanchit_goyal_resume.pdf";
    anchor.download = "Sanchit_Goyal_Resume.pdf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function buildResumeText() {
    const socialLines = (DATA.socialLinks || []).map((link) => `${link.label}: ${link.url}`).join("\n");
    const skillLines = (DATA.skills || [])
      .map((skill) => {
        const items = (skill.items || [])
          .map((item) => (typeof item === "string" ? item : `${item.name} (${item.proficiency}%)`))
          .join(", ");
        return `${skill.category}: ${items}`;
      })
      .join("\n");

    return `Sanchit Goyal
Aspiring Data Scientist | Machine Learning Enthusiast | AI Research Enthusiast
Email: ${DATA.owner?.email || "sanchitgoyal11092007@gmail.com"}

Professional Summary
Building intelligent systems, exploring machine learning, and developing data-driven solutions through continuous learning, research, and practical innovation.

Education
${DATA.owner?.education || "B.Tech Computer Science Engineering, Data Science and Machine Learning specialization"}

Current Focus
Data Structures and Algorithms, machine learning foundations, data science practice, and practical project development.

Skills
${skillLines}

Public Profiles
${socialLines}
`;
  }

  function buildSkillAnswer() {
    return `Sanchit's current skill map is intentionally transparent:

**AI & Machine Learning:** Scikit-Learn, TensorFlow, PyTorch, NLTK, OpenCV, Transformers, Hugging Face, XGBoost, ML, deep learning, NLP, computer vision, generative AI, and prompt engineering.

**Data Science:** NumPy, Pandas, Matplotlib, Seaborn, Plotly, Power BI, cleaning, EDA, statistics, visualization, feature engineering, and analysis.

**Programming:** Python and C are the strongest current languages, with C++ and Java in progress.

**Tools:** Git, GitHub, VS Code, Jupyter Notebook, Google Colab, Docker, Linux, Postman, Firebase, Vercel, Netlify, Figma, Canva, Notion, ChatGPT, Claude, Gemini, Cursor, Power BI, and MySQL Workbench.`;
  }

  function buildTechnicalAnswer(message) {
    const lower = message.toLowerCase();

    if (lower.includes("python")) {
      return `Python is central to Sanchit's AI and data science direction because it connects clean syntax with a mature ecosystem for analysis and modeling.

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split

data = pd.read_csv("dataset.csv")
train, test = train_test_split(data, test_size=0.2, random_state=42)
\`\`\`

That kind of workflow fits his current path: data handling, experimentation, and machine learning foundations.`;
    }

    if (lower.includes("machine learning") || /\bml\b/.test(lower)) {
      return "Machine learning is the practice of building systems that learn patterns from data and use those patterns for prediction, classification, recommendation, generation, or decision support. For Sanchit, the near-term focus is foundations: data preprocessing, model training, evaluation, feature engineering, and practical experimentation.";
    }

    if (lower.includes("data science")) {
      return "Data science is the bridge between raw data and useful decisions. Sanchit's current data science stack includes NumPy, Pandas, visualization tools, statistics, EDA, feature engineering, and Power BI, which gives him a strong base for future ML projects.";
    }

    if (lower.includes("dsa") || lower.includes("algorithm")) {
      return "DSA matters because it improves problem-solving discipline, efficiency thinking, and coding interview readiness. Sanchit is currently exploring data structures and algorithms while continuing his machine learning path.";
    }

    return "Technically, Sanchit's direction is centered on AI, machine learning, data science, and software fundamentals. He is still early in the journey, but the portfolio is structured to show growth honestly while giving recruiters a clear signal of direction.";
  }

  function setupDialog() {
    const dialog = $("#certificateDialog");
    if (!dialog) return;

    $(".dialog-close", dialog)?.addEventListener("click", () => dialog.close?.() || dialog.removeAttribute("open"));
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const isBackdropClick =
        event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (isBackdropClick) dialog.close?.();
    });
  }

  function setupFooterYear() {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function setupContactForm() {
    const form = $("#contactForm");
    const submitBtn = $("#contactSubmitBtn");
    const alertBox = $("#formStatusAlert");

    if (!form || !submitBtn) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // Clear alert box and errors
      alertBox.className = "form-alert";
      alertBox.textContent = "";
      alertBox.style.display = "none";

      const inputs = $$("input, textarea", form);
      let isValid = true;

      inputs.forEach((input) => {
        const group = input.closest(".form-group");
        if (!group) return;

        // Check required fields
        if (input.required && !input.value.trim()) {
          group.classList.add("is-invalid");
          isValid = false;
        } else {
          group.classList.remove("is-invalid");
        }

        // Check email format
        if (input.type === "email" && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            group.classList.add("is-invalid");
            isValid = false;
          }
        }
      });

      if (!isValid) {
        alertBox.textContent = "Please correct the highlighted fields.";
        alertBox.className = "form-alert is-error";
        alertBox.style.display = "block";
        return;
      }

      // 1. Loading state
      form.setAttribute("aria-busy", "true");
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;
      const btnTextElement = $(".btn-text", submitBtn);
      const originalBtnText = btnTextElement ? btnTextElement.textContent : "Send Message";
      if (btnTextElement) {
        btnTextElement.textContent = "Sending...";
      }
      inputs.forEach(input => input.disabled = true);

      // Get values
      const name = $("#contactName").value.trim();
      const email = $("#contactEmail").value.trim();
      const subject = $("#contactSubject").value.trim();
      const message = $("#contactMessage").value.trim();

      // Submit to Formspree
      fetch("https://formspree.io/f/meedydge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message
        })
      })
      .then((response) => {
        if (response.ok) {
          // Success state transition
          submitBtn.classList.remove("is-loading");
          submitBtn.classList.add("is-success");
          if (btnTextElement) {
            btnTextElement.textContent = "Sent";
          }

          alertBox.textContent = "Thank you for reaching out. Your message has been sent successfully. I will get back to you as soon as possible.";
          alertBox.className = "form-alert is-success";
          alertBox.style.display = "block";
          alertBox.setAttribute("tabindex", "-1");
          alertBox.focus();
          form.removeAttribute("aria-busy");

          // Clear all fields
          form.reset();

          // Reset state after a delay
          window.setTimeout(() => {
            submitBtn.classList.remove("is-success");
            submitBtn.disabled = false;
            if (btnTextElement) {
              btnTextElement.textContent = originalBtnText;
            }
            inputs.forEach(input => input.disabled = false);
            alertBox.style.display = "none";
            alertBox.className = "form-alert";
            alertBox.textContent = "";
          }, 4000);
        } else {
          return response.json().then((data) => {
            throw new Error(data.error || "Submission failed");
          });
        }
      })
      .catch((error) => {
        // Error state transition
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
        if (btnTextElement) {
          btnTextElement.textContent = "Retry Send";
        }
        inputs.forEach(input => input.disabled = false);

        alertBox.textContent = "Something went wrong. Please try again later.";
        alertBox.className = "form-alert is-error";
        alertBox.style.display = "block";
        alertBox.setAttribute("tabindex", "-1");
        alertBox.focus();
        form.removeAttribute("aria-busy");
      });
    });

    // Clear validation error on input
    $$("input, textarea", form).forEach((input) => {
      input.addEventListener("input", () => {
        const group = input.closest(".form-group");
        if (group && group.classList.contains("is-invalid")) {
          group.classList.remove("is-invalid");
        }
        const btnTextElement = $(".btn-text", submitBtn);
        if (btnTextElement && btnTextElement.textContent === "Retry Send") {
          btnTextElement.textContent = "Send Message";
        }
      });
    });
  }

  function setupToolsFiltering() {
    const filterBtns = $$(".tools-filter-btn");
    const badges = $$(".tool-flat-badge");
    if (!filterBtns.length || !badges.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        if (!filter) return;

        // Toggle active button states
        filterBtns.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        // Filter badges
        badges.forEach((badge) => {
          const categories = badge.dataset.category ? badge.dataset.category.split(" ") : [];
          badge.classList.remove("animate-in");

          if (filter === "all" || categories.includes(filter)) {
            badge.classList.remove("hidden");
            // Force reflow to restart CSS animation
            void badge.offsetWidth;
            badge.classList.add("animate-in");
          } else {
            badge.classList.add("hidden");
          }
        });
      });
    });
  }

  function setupScrollAndCursorGlow() {
    // 1. Scroll Progress Bar
    const scrollBar = $("#scrollBar");
    if (scrollBar) {
      const updateScrollProgress = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        scrollBar.style.width = `${progress}%`;
      };
      window.addEventListener("scroll", updateScrollProgress, { passive: true });
      window.addEventListener("resize", updateScrollProgress, { passive: true });
      updateScrollProgress();
    }

    // 2. Mouse Glow Follower with Easing
    const mouseGlow = $("#mouseGlow");
    if (mouseGlow && !prefersReducedMotion) {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isGlowActive = false;

      window.addEventListener("pointermove", (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!isGlowActive) {
          isGlowActive = true;
          mouseGlow.classList.add("active");
        }
      }, { passive: true });

      document.addEventListener("pointerleave", () => {
        isGlowActive = false;
        mouseGlow.classList.remove("active");
      });

      const tick = () => {
        if (isGlowActive) {
          currentX += (targetX - currentX) * 0.08;
          currentY += (targetY - currentY) * 0.08;
          mouseGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  // Reset all static progress labels to "0%" so they animate correctly when revealed
  document.querySelectorAll(".skill-row .progress-fill[data-progress]").forEach((fill) => {
    const label = fill.closest(".skill-row")?.querySelector(".progress-value");
    if (label) label.textContent = "0%";
  });

  renderSocialLinks();
  renderSkills();
  renderProjects();
  renderCertificates();
  setupNavigation();
  observeReveals();
  setupCounters();
  setupTypewriter();
  setupParticles();
  setupResumeActions();
  setupDialog();
  setupFooterYear();
  setupContactForm();
  setupToolsFiltering();
  setupScrollAndCursorGlow();
})();
