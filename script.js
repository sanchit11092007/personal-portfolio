(() => {
  "use strict";

  const DATA = window.PORTFOLIO_DATA || {};
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    projectFilter: "all",
    certificateFilter: "all",
    chat: [],
    voiceOutput: false,
    recognition: null
  };

  const introMessage =
    "Hey, I'm SAE AI. I can help you explore Sanchit's skills, learning journey, projects, public profiles, and technical interests. Ask me anything about his portfolio or current AI direction.";

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
    anchor.rel = "noreferrer";
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
      anchor.dataset.tooltip = link.label;
      anchor.setAttribute("aria-label", link.label);
      anchor.innerHTML = `<span aria-hidden="true">${escapeHTML(link.short)}</span><span class="sr-only">${escapeHTML(link.label)}</span>`;
      fragment.appendChild(anchor);
    });
    container.replaceChildren(fragment);
  }

  function renderSkills() {
    const container = $("#skillsGrid");
    if (!container || !Array.isArray(DATA.skills)) return;

    const fragment = document.createDocumentFragment();

    DATA.skills.forEach((skill) => {
      const card = createElement("article", "skill-card reveal");
      const header = createElement("header");
      const titleWrap = createElement("div");
      titleWrap.append(createElement("h3", "", skill.category));
      if (skill.description) titleWrap.append(createElement("p", "", skill.description));
      header.append(titleWrap);

      if (typeof skill.proficiency === "number") {
        header.append(createElement("div", "skill-score", `${skill.proficiency}%`));
      }

      card.append(header);

      if (typeof skill.proficiency === "number") {
        card.append(createProgressRow("Professional Proficiency", skill.proficiency));
      }

      if (skill.badgeOnly || typeof skill.items?.[0] === "string") {
        const cloud = createElement("div", "badge-cloud");
        skill.items.forEach((item) => cloud.append(createElement("span", "tech-badge", item)));
        card.append(cloud);
      } else {
        const list = createElement("div", "skill-list");
        skill.items.forEach((item) => list.append(createProgressRow(item.name, item.proficiency)));
        card.append(list);
      }

      fragment.append(card);
    });

    container.replaceChildren(fragment);
  }

  function createProgressRow(label, value) {
    const row = createElement("div", "skill-row");
    const top = createElement("div", "skill-row-top");
    top.append(createElement("span", "", label));
    top.append(createElement("span", "", `${value}%`));
    const track = createElement("div", "progress-track");
    const fill = createElement("span", "progress-fill");
    fill.dataset.progress = String(value);
    track.append(fill);
    row.append(top, track);
    return row;
  }

  function renderFilters(containerSelector, categories, active, onSelect) {
    const container = $(containerSelector);
    if (!container) return;

    const fragment = document.createDocumentFragment();
    const allButton = createFilterButton("all", "All", active === "all", onSelect);
    fragment.append(allButton);
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
    renderFilters("#projectFilters", categories, state.projectFilter, (id) => {
      state.projectFilter = id;
      renderProjects();
    });

    const container = $("#projectGrid");
    if (!container) return;

    const visibleCategories =
      state.projectFilter === "all" ? categories : categories.filter((category) => category.id === state.projectFilter);
    const projects = (DATA.projects || []).filter(
      (project) => state.projectFilter === "all" || project.category === state.projectFilter
    );

    const fragment = document.createDocumentFragment();
    projects.forEach((project) => fragment.append(createProjectCard(project)));

    visibleCategories.forEach((category) => {
      const hasProject = (DATA.projects || []).some((project) => project.category === category.id);
      if (!hasProject) fragment.append(createEmptyState(category.title, category.empty));
    });

    container.replaceChildren(fragment);
    observeReveals();
  }

  function createProjectCard(project) {
    const card = createElement("article", "project-card reveal");
    const image = new Image();
    image.className = "project-image";
    image.src = project.image || "assets/hero-ai-lab.png";
    image.alt = project.title ? `${project.title} preview` : "Project preview";
    image.loading = "lazy";

    const body = createElement("div", "project-body");
    body.append(createElement("h3", "", project.title || "Project"));
    body.append(createElement("p", "", project.description || ""));

    const stack = createElement("div", "project-stack");
    (project.techStack || []).forEach((tech) => stack.append(createElement("span", "", tech)));
    body.append(stack);

    const actions = createElement("div", "card-actions");
    if (project.codeUrl) actions.append(externalLink(project.codeUrl, "View Code", "button button-secondary"));
    if (project.demoUrl) actions.append(externalLink(project.demoUrl, "Live Demo", "button button-primary"));
    body.append(actions);

    card.append(image, body);
    return card;
  }

  function createEmptyState(title, message) {
    const card = createElement("article", "empty-state reveal");
    const visual = createElement("div", "empty-visual");
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", `${title} portfolio category visual`);
    const body = createElement("div", "empty-body");
    body.append(createElement("h3", "", title));
    body.append(createElement("p", "", message));
    card.append(visual, body);
    return card;
  }

  function renderCertificates() {
    const categories = DATA.certificationCategories || [];
    renderFilters("#certificateFilters", categories, state.certificateFilter, (id) => {
      state.certificateFilter = id;
      renderCertificates();
    });

    const container = $("#certificateGrid");
    if (!container) return;

    const visibleCategories =
      state.certificateFilter === "all"
        ? categories
        : categories.filter((category) => category.id === state.certificateFilter);
    const certificates = (DATA.certifications || []).filter(
      (certificate) => state.certificateFilter === "all" || certificate.category === state.certificateFilter
    );

    const fragment = document.createDocumentFragment();
    certificates.forEach((certificate) => fragment.append(createCertificateCard(certificate)));
    visibleCategories.forEach((category) => {
      const hasCertificate = (DATA.certifications || []).some((certificate) => certificate.category === category.id);
      if (!hasCertificate) {
        fragment.append(
          createEmptyState(
            category.title,
            "Verified certificates in this category will appear here with issuer, issue date, skills learned, verification link, and full-screen preview support."
          )
        );
      }
    });

    container.replaceChildren(fragment);
    observeReveals();
  }

  function createCertificateCard(certificate) {
    const card = createElement("article", "certificate-card reveal");
    const image = new Image();
    image.className = "certificate-image";
    image.src = certificate.image || "assets/hero-ai-lab.png";
    image.alt = certificate.name ? `${certificate.name} certificate` : "Certificate image";
    image.loading = "lazy";

    const body = createElement("div", "certificate-body");
    body.append(createElement("h3", "", certificate.name || "Certificate"));
    body.append(createElement("p", "", `${certificate.issuer || "Issuer"} - ${certificate.issueDate || "Issue date"}`));
    body.append(createElement("p", "", certificate.description || ""));

    const skills = createElement("div", "certificate-skills");
    (certificate.skills || []).forEach((skill) => skills.append(createElement("span", "", skill)));
    body.append(skills);

    const actions = createElement("div", "card-actions");
    const preview = createElement("button", "button button-secondary", "View Certificate");
    preview.type = "button";
    preview.addEventListener("click", () => openCertificate(certificate));
    actions.append(preview);
    if (certificate.verificationUrl) {
      actions.append(externalLink(certificate.verificationUrl, "Verification Link", "button button-primary"));
    }
    body.append(actions);

    card.append(image, body);
    return card;
  }

  function openCertificate(certificate) {
    const dialog = $("#certificateDialog");
    if (!dialog) return;

    $("#certificateDialogImage").src = certificate.image || "";
    $("#certificateDialogImage").alt = certificate.name ? `${certificate.name} certificate preview` : "Certificate preview";
    $("#certificateDialogTitle").textContent = certificate.name || "Certificate";
    $("#certificateDialogMeta").textContent = `${certificate.issuer || "Issuer"} - ${certificate.issueDate || "Issue date"}`;
    const link = $("#certificateDialogLink");
    link.href = certificate.verificationUrl || "#";
    link.style.display = certificate.verificationUrl ? "inline-flex" : "none";

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function renderActivity() {
    const container = $("#activityGrid");
    if (!container || !Array.isArray(DATA.activity)) return;

    const fragment = document.createDocumentFragment();
    DATA.activity.forEach((item) => {
      const card = createElement("article", "activity-card reveal");
      const top = createElement("div", "activity-top");
      const title = createElement("div");
      title.append(createElement("h3", "", item.platform));
      title.append(createElement("small", "", item.metric));
      top.append(title);
      top.append(createElement("span", "activity-icon", item.short));

      const stat = createElement("div", "activity-number");
      stat.dataset.count = String(item.count || 0);
      stat.dataset.suffix = item.suffix || "";
      stat.textContent = "0";

      card.append(top, stat, createElement("p", "", item.summary));
      card.append(externalLink(item.url, "Open Profile", ""));
      fragment.append(card);
    });

    container.replaceChildren(fragment);
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
        { threshold: 0.18, rootMargin: "0px 0px -48px 0px" }
      );
    }

    elements.forEach((element) => {
      element.dataset.observed = "true";
      revealObserver.observe(element);
    });
  }

  function runProgressAnimations(scope) {
    $$(".progress-fill", scope).forEach((fill) => {
      fill.style.width = `${fill.dataset.progress || 0}%`;
    });
  }

  function setupCounters() {
    const counters = $$(".activity-number");
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

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(86, Math.max(36, Math.floor(width / 18)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: Math.random() * 1.4 + 0.4
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
        ctx.fillStyle = "rgba(46, 247, 255, 0.45)";
        ctx.fill();

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 118) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(91, 141, 239, ${0.16 * (1 - distance / 118)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(draw);
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
    draw();
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
    const blob = new Blob([buildResumeText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Sanchit_Goyal_Resume.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
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
AI Engineer | Machine Learning Engineer | Data Scientist
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

  function setupAssistant() {
    const chatWindow = $("#chatMessages");
    const form = $("#chatForm");
    const input = $("#chatInput");
    if (!chatWindow || !form || !input) return;

    restoreConversation();
    renderChat();
    renderQuickPrompts();
    setupVoiceControls();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      autoSizeTextarea(input);
      await sendUserMessage(message);
    });

    input.addEventListener("input", () => autoSizeTextarea(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    $("#clearChat")?.addEventListener("click", () => {
      state.chat = [{ role: "assistant", content: introMessage }];
      persistConversation();
      renderChat();
    });
  }

  async function sendUserMessage(message) {
    state.chat.push({ role: "user", content: message });
    persistConversation();
    renderChat();
    showTypingIndicator();

    const reply = await assistantEngine.respond(message);
    await wait(prefersReducedMotion ? 80 : Math.min(900, 300 + reply.length * 8));
    hideTypingIndicator();

    state.chat.push({ role: "assistant", content: reply });
    persistConversation();
    renderChat();

    if (state.voiceOutput) speak(reply);
  }

  const assistantEngine = {
    mode: "local",
    async respond(message) {
      const lower = message.toLowerCase();

      if (/\b(hello|hey|hi|namaste)\b/.test(lower)) {
        return "Hello. I'm SAE AI, Sanchit's portfolio assistant. I can help you understand his AI direction, skills, public profiles, learning journey, and current project roadmap.";
      }

      if (/\b(project|projects|built|demo|code|github)\b/.test(lower)) {
        return `Sanchit's portfolio is organized into four project tracks:

**Artificial Intelligence & Machine Learning**
**Data Science & Analytics**
**Software Development & Programming**
**Experimental & Research Projects**

The current public project slots are intentionally marked as expanding, so recruiters can see the roadmap without invented work. His GitHub profile is available here: [GitHub](https://github.com/sanchit11092007).`;
      }

      if (/\b(skill|stack|technology|technologies|tools|proficiency)\b/.test(lower)) {
        return buildSkillAnswer();
      }

      if (/\b(journey|timeline|education|college|lpu|learned|learning)\b/.test(lower)) {
        return `Sanchit began his B.Tech Computer Science Engineering journey at Lovely Professional University in **August 2025**, specializing in Data Science and Machine Learning.

His path moves from programming and data science foundations to NumPy, Pandas, stronger programming concepts, machine learning foundations, practical projects, and the current stage of DSA plus deeper ML work. The long-term direction is AI Engineering, ML Engineering, and Data Science.`;
      }

      if (/\b(interview|hire|recruiter|internship|worth)\b/.test(lower)) {
        return `A recruiter should interview Sanchit because his profile shows a clear direction, not a random collection of interests.

He is building foundations in AI, machine learning, data science, programming, and DSA while also paying attention to cyber security, blockchain, and cloud computing. That combination suggests a learner who can grow into systems-level AI engineering work and communicate his progress transparently.`;
      }

      if (/\b(certification|certificate|certificates)\b/.test(lower)) {
        return "The certification section is structured for future verified certificates with image preview, issuer, issue date, skills learned, verification link, and full-screen viewing. It is ready to scale as Sanchit earns and adds new credentials.";
      }

      if (/\b(contact|email|linkedin|connect)\b/.test(lower)) {
        return `You can contact Sanchit by email at [sanchitgoyal11092007@gmail.com](mailto:sanchitgoyal11092007@gmail.com), or review his professional profile on [LinkedIn](https://www.linkedin.com/in/the-sanchit-goyal).`;
      }

      if (/\b(machine learning|ml|ai|artificial intelligence|data science|python|dsa|algorithm|cloud|blockchain|cyber)\b/.test(lower)) {
        return buildTechnicalAnswer(message);
      }

      return "I can help with portfolio questions, technical questions, general conversation, Sanchit's learning journey, his skills, his project roadmap, and his public profiles. Try asking what he is learning now, which skills he has, or why his profile is recruiter-friendly.";
    }
  };

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

  function renderQuickPrompts() {
    const container = $("#quickPrompts");
    if (!container) return;

    const fragment = document.createDocumentFragment();
    (DATA.assistantPrompts || []).forEach((prompt) => {
      const button = createElement("button", "", prompt);
      button.type = "button";
      button.addEventListener("click", () => sendUserMessage(prompt));
      fragment.append(button);
    });
    container.replaceChildren(fragment);
  }

  function restoreConversation() {
    try {
      const saved = JSON.parse(localStorage.getItem("sae-ai-chat") || "[]");
      state.chat = Array.isArray(saved) && saved.length ? saved : [{ role: "assistant", content: introMessage }];
    } catch {
      state.chat = [{ role: "assistant", content: introMessage }];
    }
  }

  function persistConversation() {
    try {
      localStorage.setItem("sae-ai-chat", JSON.stringify(state.chat.slice(-40)));
    } catch {
      // Local storage can be unavailable in private or restricted browser modes.
    }
  }

  function renderChat() {
    const chatWindow = $("#chatMessages");
    if (!chatWindow) return;

    const fragment = document.createDocumentFragment();
    state.chat.forEach((message) => fragment.append(createMessage(message.role, message.content)));
    chatWindow.replaceChildren(fragment);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function createMessage(role, content) {
    const message = createElement("article", `message ${role}`);
    message.append(createElement("span", "message-meta", role === "user" ? "You" : "SAE AI"));
    const bubble = createElement("div", "message-bubble");
    bubble.innerHTML = renderMarkdown(content);
    message.append(bubble);
    return message;
  }

  function showTypingIndicator() {
    const chatWindow = $("#chatMessages");
    if (!chatWindow) return;

    const typing = createElement("article", "message assistant");
    typing.dataset.typing = "true";
    typing.append(createElement("span", "message-meta", "SAE AI"));
    const bubble = createElement("div", "message-bubble");
    bubble.innerHTML = '<span class="typing-dots" aria-label="SAE AI is typing"><span></span><span></span><span></span></span>';
    typing.append(bubble);
    chatWindow.append(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function hideTypingIndicator() {
    $('[data-typing="true"]')?.remove();
  }

  function renderMarkdown(markdown) {
    const parts = String(markdown).split("```");
    return parts
      .map((part, index) => {
        if (index % 2 === 1) return renderCodeBlock(part);
        return renderRichText(part);
      })
      .join("");
  }

  function renderCodeBlock(block) {
    const cleaned = block.replace(/^\n/, "").replace(/\n$/, "");
    const lines = cleaned.split("\n");
    if (/^[a-z0-9#+.-]+$/i.test(lines[0] || "") && lines.length > 1) lines.shift();
    return `<pre><code>${escapeHTML(lines.join("\n"))}</code></pre>`;
  }

  function renderRichText(text) {
    return escapeHTML(text)
      .trim()
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph) => {
        const inline = paragraph
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\n/g, "<br>");
        return `<p>${inline}</p>`;
      })
      .join("");
  }

  function setupVoiceControls() {
    const outputButton = $("#voiceOutput");
    const inputButton = $("#voiceInput");

    outputButton?.setAttribute("data-tooltip", "Voice output");
    inputButton?.setAttribute("data-tooltip", "Voice input");
    $("#clearChat")?.setAttribute("data-tooltip", "Clear chat");

    outputButton?.addEventListener("click", () => {
      state.voiceOutput = !state.voiceOutput;
      outputButton.setAttribute("aria-pressed", String(state.voiceOutput));
      if (!state.voiceOutput && "speechSynthesis" in window) window.speechSynthesis.cancel();
    });

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition || !inputButton) {
      inputButton?.setAttribute("disabled", "");
      inputButton?.setAttribute("aria-label", "Voice input unavailable");
      return;
    }

    state.recognition = new Recognition();
    state.recognition.lang = "en-US";
    state.recognition.interimResults = false;
    state.recognition.maxAlternatives = 1;

    state.recognition.addEventListener("start", () => inputButton.classList.add("is-listening"));
    state.recognition.addEventListener("end", () => inputButton.classList.remove("is-listening"));
    state.recognition.addEventListener("result", (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        $("#chatInput").value = transcript;
        $("#chatForm").requestSubmit();
      }
    });

    inputButton.addEventListener("click", () => {
      try {
        state.recognition.start();
      } catch {
        state.recognition.stop();
      }
    });
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function stripMarkdown(text) {
    return String(text)
      .replace(/```[\s\S]*?```/g, "code example omitted")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`#>]/g, "")
      .replace(/\n+/g, " ");
  }

  function autoSizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
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

  renderSocialLinks();
  renderSkills();
  renderProjects();
  renderCertificates();
  renderActivity();
  setupNavigation();
  observeReveals();
  setupCounters();
  setupTypewriter();
  setupParticles();
  setupResumeActions();
  setupAssistant();
  setupDialog();
  setupFooterYear();
})();
