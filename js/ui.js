(function () {
  "use strict";

  const root = document.documentElement;

  // Force dark mode
  root.dataset.theme = "dark";
  root.style.colorScheme = "dark";

  function openAssistant() {
    if (window.pankrixAI && typeof window.pankrixAI.open === "function") {
      window.pankrixAI.open();
      return;
    }

    window.dispatchEvent(new CustomEvent("pankrix-ai:open"));
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-pankrix-ai]")) {
      openAssistant();
    }
  });

  window.PortfolioUI = {
    openAssistant
  };
})();
