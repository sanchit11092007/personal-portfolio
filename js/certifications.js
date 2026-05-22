/**
 * Certifications Engine
 * ─────────────────────
 * Dynamically renders certification cards from CertificationsData.
 * Handles tab switching, animations, and empty-state placeholders.
 */

(function () {
  "use strict";

  const CONTAINER_ID = "certTabContent";
  const TABS_ID = "certTabs";

  function init() {
    const data = window.CertificationsData;
    if (!data || !data.categories) return;

    renderTabs(data.categories);
    renderContent(data.categories);
    activateTab(data.categories[0]?.id);
    bindEvents();
  }

  /* ── Tab Buttons ── */
  function renderTabs(categories) {
    const tabsContainer = document.getElementById(TABS_ID);
    if (!tabsContainer) return;

    tabsContainer.innerHTML = categories
      .map(
        (cat, i) => `
      <button
        class="cert-tab${i === 0 ? " cert-tab--active" : ""}"
        data-tab="${cat.id}"
        type="button"
        role="tab"
        aria-selected="${i === 0}"
        aria-controls="panel-${cat.id}"
      >
        <span class="cert-tab-icon">${cat.icon}</span>
        <span class="cert-tab-label">${cat.label}</span>
      </button>
    `
      )
      .join("");
  }

  /* ── Tab Panels (Content) ── */
  function renderContent(categories) {
    const contentContainer = document.getElementById(CONTAINER_ID);
    if (!contentContainer) return;

    contentContainer.innerHTML = categories
      .map(
        (cat, i) => `
      <div
        class="cert-panel${i === 0 ? " cert-panel--active" : ""}"
        id="panel-${cat.id}"
        role="tabpanel"
        aria-labelledby="tab-${cat.id}"
      >
        ${cat.certs.length > 0 ? renderCards(cat.certs) : renderEmptyState(cat.label)}
      </div>
    `
      )
      .join("");
  }

  /* ── Certification Cards ── */
  function renderCards(certs) {
    return `<div class="cert-grid">${certs
      .map(
        (cert) => `
        <article class="cert-card">
          ${
            cert.thumbnail
              ? `<div class="cert-thumb">
                   <img src="${cert.thumbnail}" alt="${cert.title} certificate" loading="lazy" />
                   <button class="cert-thumb-overlay cert-open" type="button" 
                           data-certificate="${cert.title} - ${cert.issuer} (${cert.year})"
                           data-full-image="${cert.fullImage}"
                           data-verification-link="${cert.verificationLink || ""}">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                     <span>View Certificate</span>
                   </button>
                 </div>`
              : ""
          }
          <span class="cert-year">${cert.year}</span>
          <h3>${cert.title}</h3>
          <p class="cert-issuer">${cert.issuer}</p>
          ${cert.description ? `<p class="cert-desc">${cert.description}</p>` : ""}
          ${
            cert.skills.length
              ? `<div class="cert-skills">${cert.skills.map((s) => `<span>${s}</span>`).join("")}</div>`
              : ""
          }
        </article>
      `
      )
      .join("")}</div>`;
  }

  /* ── Empty State ── */
  function renderEmptyState(categoryLabel) {
    return `
      <div class="cert-empty">
        <div class="cert-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="40" height="40">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>
          </svg>
        </div>
        <h4>Coming Soon</h4>
        <p>Currently expanding expertise in <strong>${categoryLabel}</strong>. Certifications and achievements will be added here as they are completed.</p>
      </div>
    `;
  }

  /* ── Tab Switching ── */
  function activateTab(tabId) {
    if (!tabId) return;

    // Update tab buttons
    document.querySelectorAll(".cert-tab").forEach((tab) => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle("cert-tab--active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    // Update panels with animation
    document.querySelectorAll(".cert-panel").forEach((panel) => {
      const isActive = panel.id === `panel-${tabId}`;
      if (isActive) {
        panel.classList.add("cert-panel--active");
      } else {
        panel.classList.remove("cert-panel--active");
      }
    });

    // Re-bind modal buttons for new panel
    rebindModalButtons();
  }

  function rebindModalButtons() {
    // If the modal logic is handled by main.js globally, we can just trigger a custom event 
    // or re-call a global function. Since initCertificateModal is in main.js, we can dispatch an event.
    // However, it's safer to just bind the click directly here since we have the elements.
    const modal = document.querySelector("#certificateModal");
    const modalTitle = document.querySelector("#modalTitle");
    const modalImage = document.querySelector("#modalImage");
    const modalVerifyBtn = document.querySelector("#modalVerifyBtn");

    if (!modal || !modalTitle) return;

    document.querySelectorAll(".cert-panel--active .cert-open").forEach((button) => {
      // Remove old listeners by cloning
      const newBtn = button.cloneNode(true);
      button.parentNode.replaceChild(newBtn, button);
      
      newBtn.addEventListener("click", () => {
        // Set Title
        modalTitle.textContent = newBtn.dataset.certificate || "Certificate";
        
        // Set Image
        if (modalImage && newBtn.dataset.fullImage) {
          modalImage.src = newBtn.dataset.fullImage;
          modalImage.style.display = "block";
        } else if (modalImage) {
          modalImage.style.display = "none";
        }

        // Set Verify Button
        if (modalVerifyBtn && newBtn.dataset.verificationLink) {
          modalVerifyBtn.href = newBtn.dataset.verificationLink;
          modalVerifyBtn.style.display = "inline-flex";
        } else if (modalVerifyBtn) {
          modalVerifyBtn.style.display = "none";
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");
        modal.querySelector(".modal-close")?.focus();
      });
    });
  }

  /* ── Events ── */
  function bindEvents() {
    const tabsContainer = document.getElementById(TABS_ID);
    if (!tabsContainer) return;

    tabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".cert-tab");
      if (!tab) return;
      activateTab(tab.dataset.tab);
    });

    // Keyboard navigation
    tabsContainer.addEventListener("keydown", (e) => {
      const tabs = [...tabsContainer.querySelectorAll(".cert-tab")];
      const current = tabs.findIndex((t) => t.classList.contains("cert-tab--active"));
      let next = current;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (current + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (current - 1 + tabs.length) % tabs.length;
      } else {
        return;
      }

      e.preventDefault();
      tabs[next].focus();
      activateTab(tabs[next].dataset.tab);
    });
  }

  /* ── Bootstrap ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
