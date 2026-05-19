const animationReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initReveals();
  initCounters();
  initTiltCards();
  initRoleSwitcher();
});

function initReveals() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!revealItems.length) return;

  if (animationReduced) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    revealObserver.observe(item);
  });
}

function initCounters() {
  const counters = [...document.querySelectorAll(".counter")];
  if (!counters.length) return;

  const runCounter = (counter) => {
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || "";
    const duration = animationReduced ? 1 : 1300;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initTiltCards() {
  if (animationReduced || window.matchMedia("(pointer: coarse)").matches) return;

  const tiltItems = [...document.querySelectorAll("[data-tilt]")];
  const maxTilt = 7;

  tiltItems.forEach((item) => {
    let frameId = 0;

    const updateTilt = (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        item.style.transform = `perspective(900px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) translateY(-3px)`;
      });
    };

    const resetTilt = () => {
      cancelAnimationFrame(frameId);
      item.style.transform = "";
    };

    item.addEventListener("pointermove", updateTilt);
    item.addEventListener("pointerleave", resetTilt);
    item.addEventListener("blur", resetTilt);
  });
}

function initRoleSwitcher() {
  const roleElement = document.querySelector("#roleSwitcher");
  if (!roleElement) return;

  const roles = [
    "AI Engineer",
    "Data Scientist",
    "ML Enthusiast",
    "Problem Solver",
    "Aspiring Software Engineer"
  ];

  if (animationReduced) {
    roleElement.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = roles[roleIndex];
    const nextText = deleting ? current.slice(0, charIndex - 1) : current.slice(0, charIndex + 1);
    roleElement.textContent = nextText;
    charIndex = nextText.length;

    let delay = deleting ? 45 : 78;

    if (!deleting && charIndex === current.length) {
      delay = 1400;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 250;
    }

    window.setTimeout(type, delay);
  };

  window.setTimeout(type, 600);
}
