const SELECTORS = {
  header: "#siteHeader",
  menuToggle: "#menuToggle",
  navPanel: "#navPanel",
  navLinks: ".nav-link",
  navIndicator: "#navIndicator",
  sections: "[data-section]",
  preloader: "#preloader",
  modal: "#certificateModal",
  modalTitle: "#modalTitle",
  certificateButtons: ".cert-open"
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initNavigation();
  initCertificateModal();
  setCurrentYear();
  initContactForm();
  initChatbot();
});

function initPreloader() {
  const preloader = document.querySelector(SELECTORS.preloader);
  if (!preloader) return;

  const hidePreloader = () => {
    document.body.classList.add("loaded");
    window.setTimeout(() => {
      preloader.setAttribute("hidden", "");
    }, 650);
  };

  if (document.readyState === "complete") {
    window.setTimeout(hidePreloader, prefersReducedMotion ? 0 : 500);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hidePreloader, prefersReducedMotion ? 0 : 700);
    });
  }
}

function initNavigation() {
  const header = document.querySelector(SELECTORS.header);
  const menuToggle = document.querySelector(SELECTORS.menuToggle);
  const navPanel = document.querySelector(SELECTORS.navPanel);
  const navLinks = [...document.querySelectorAll(SELECTORS.navLinks)];
  const indicator = document.querySelector(SELECTORS.navIndicator);
  const sections = [...document.querySelectorAll(SELECTORS.sections)];

  const syncHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 16);
  };

  const closeMenu = () => {
    menuToggle?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
    navPanel?.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  const setActiveLink = (id) => {
    const activeLink = navLinks.find((link) => link.getAttribute("href") === `#${id}`);
    navLinks.forEach((link) => link.classList.toggle("active", link === activeLink));
    moveIndicator(activeLink, indicator);
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    navPanel?.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
    link.addEventListener("mouseenter", () => moveIndicator(link, indicator));
  });

  navPanel?.addEventListener("mouseleave", () => {
    const active = document.querySelector(".nav-link.active");
    moveIndicator(active, indicator);
  });

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-42% 0px -48% 0px",
      threshold: 0.01
    }
  );

  sections.forEach((section) => navObserver.observe(section));
  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", () => {
    const active = document.querySelector(".nav-link.active");
    moveIndicator(active, indicator);
  });

  syncHeader();
  moveIndicator(document.querySelector(".nav-link.active"), indicator);
}

function moveIndicator(link, indicator) {
  if (!link || !indicator || window.innerWidth <= 920) return;
  const panel = link.closest(".nav-panel");
  const panelRect = panel.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${linkRect.left - panelRect.left}px)`;
  indicator.style.opacity = "1";
}

function initCertificateModal() {
  const modal = document.querySelector(SELECTORS.modal);
  const modalTitle = document.querySelector(SELECTORS.modalTitle);
  const buttons = document.querySelectorAll(SELECTORS.certificateButtons);
  if (!modal || !modalTitle) return;

  const modalImage = document.querySelector("#modalImage");
  const modalVerifyBtn = document.querySelector("#modalVerifyBtn");

  const openModal = (btn) => {
    modalTitle.textContent = btn.dataset.certificate || "Certificate";
    
    if (modalImage && btn.dataset.fullImage) {
      modalImage.src = btn.dataset.fullImage;
      modalImage.style.display = "block";
    } else if (modalImage) {
      modalImage.style.display = "none";
    }

    if (modalVerifyBtn && btn.dataset.verificationLink) {
      modalVerifyBtn.href = btn.dataset.verificationLink;
      modalVerifyBtn.style.display = "inline-flex";
    } else if (modalVerifyBtn) {
      modalVerifyBtn.style.display = "none";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    modal.querySelector(".modal-close")?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    
    // Clear out to prevent flashing old images on next open
    setTimeout(() => {
      if (modalImage) modalImage.src = "";
    }, 300);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]")) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}

function setCurrentYear() {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn.querySelector(".submit-label");
    const originalText = submitLabel.textContent;

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending...";
    contactForm.classList.add("submitting");

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwOmpZCz4HfFufrSYj-IUUNRhx6JIdZ09ny4R5ogG1j08STL-atJHIlnlxlzgszWBwomQ/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      if (text === "success") {
        window.location.href = "thank-you.html";
      } else {
        alert("Submission failed. Please try again.");
        submitBtn.disabled = false;
        submitLabel.textContent = originalText;
        contactForm.classList.remove("submitting");
      }
    } catch (error) {
      alert("Network error. Please try again.");
      submitBtn.disabled = false;
      submitLabel.textContent = originalText;
      contactForm.classList.remove("submitting");
    }
  });
}

function initChatbot() {
  const toggleBtn = document.getElementById('chatToggleBtn');
  const chatWindow = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatCloseBtn');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  if (!toggleBtn || !chatWindow) return;

  const toggleChat = () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      setTimeout(() => chatInput.focus(), 300);
    }
  };

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  const appendMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-indicator-wrap';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  };

  // Delegate response generation to the dedicated ChatbotBrain module (js/chatbot-brain.js)
  const getBotResponse = (input) => {
    if (window.ChatbotBrain && typeof window.ChatbotBrain.resolveIntent === 'function') {
      return window.ChatbotBrain.resolveIntent(input);
    }
    return "Sanchit's AI assistant is loading. Please try again in a moment!";
  };

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    chatInput.value = '';

    const indicator = showTypingIndicator();
    
    setTimeout(() => {
      indicator.remove();
      const response = getBotResponse(userText);
      appendMessage(response, 'bot');
    }, 1000 + Math.random() * 1000);
  });
}

