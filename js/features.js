(() => {
  "use strict";

  // Helper aliases
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", () => {
    initRecruiterScorecard();
    initRadarChart();
    initTerminalEasterEgg();
  });

  /* ==========================================================================
     3. Recruiter Scorecard
     ========================================================================== */
  function initRecruiterScorecard() {
    const circles = $$(".scorecard-fill-circle");
    if (!circles.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const targetValue = parseInt(circle.dataset.value || "0");
          const radius = circle.r.baseVal.value;
          const circumference = 2 * Math.PI * radius;
          
          circle.style.strokeDasharray = `${circumference}`;
          
          // Animate stroke
          const offset = circumference - (targetValue / 100) * circumference;
          circle.style.strokeDashoffset = `${offset}`;

          // Animate text counter
          const card = circle.closest(".scorecard-card");
          const counterEl = $(".scorecard-value", card);
          if (counterEl) {
            let start = 0;
            const duration = 1500; // ms
            const stepTime = Math.abs(Math.floor(duration / targetValue));
            
            const timer = setInterval(() => {
              start++;
              counterEl.textContent = `${start}%`;
              if (start >= targetValue) {
                clearInterval(timer);
                counterEl.textContent = `${targetValue}%`;
              }
            }, stepTime);
          }

          observer.unobserve(circle);
        }
      });
    }, { threshold: 0.1 });

    circles.forEach(circle => observer.observe(circle));
  }

  /* ==========================================================================
     4. Skill Radar Chart
     ========================================================================== */
  function initRadarChart() {
    const canvas = $("#radarChartCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Scale for High DPI displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const categories = [
      "AI & Machine Learning",
      "Data Science",
      "Software Engineering",
      "Mathematics"
    ];

    const dataSets = {
      proficiency: [80, 85, 70, 75], // Sanchit's estimated skills
      demand: [95, 90, 85, 80]      // Recruiter view market demand
    };

    let activeSet = "proficiency";
    let animationProgress = 0;
    let targetProgress = 1;
    let isAnimating = false;

    // Render configuration
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(rect.width, rect.height) * 0.35;

    function drawChart() {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const numAxes = categories.length;
      const angleStep = (Math.PI * 2) / numAxes;

      // 1. Draw web grid (rings)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const numRings = 4;
      for (let r = 1; r <= numRings; r++) {
        const radius = (maxRadius / numRings) * r;
        ctx.beginPath();
        for (let i = 0; i < numAxes; i++) {
          const angle = angleStep * i - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 2. Draw axes and category labels
      categories.forEach((cat, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const outerX = centerX + Math.cos(angle) * maxRadius;
        const outerY = centerY + Math.sin(angle) * maxRadius;

        // Draw axis line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const labelDist = maxRadius + 24;
        const labelX = centerX + Math.cos(angle) * labelDist;
        const labelY = centerY + Math.sin(angle) * labelDist;

        // Simple alignment adjustments
        if (Math.abs(Math.cos(angle)) < 0.1) {
          ctx.textAlign = "center";
        } else if (Math.cos(angle) > 0) {
          ctx.textAlign = "left";
        } else {
          ctx.textAlign = "right";
        }

        ctx.fillText(cat.toUpperCase(), labelX, labelY);
      });

      // 3. Draw filled data area
      const values = dataSets[activeSet];
      const strokeColor = activeSet === "proficiency" ? "rgba(56, 189, 248, 0.8)" : "rgba(167, 139, 250, 0.8)";
      const fillColor = activeSet === "proficiency" ? "rgba(56, 189, 248, 0.15)" : "rgba(167, 139, 250, 0.15)";
      const glowColor = activeSet === "proficiency" ? "#38bdf8" : "#a78bfa";

      ctx.beginPath();
      values.forEach((val, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const currentVal = val * animationProgress;
        const radius = (maxRadius * currentVal) / 100;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Shadow glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;

      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.shadowBlur = 0; // Reset shadow

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw markers on vertices
      values.forEach((val, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const currentVal = val * animationProgress;
        const radius = (maxRadius * currentVal) / 100;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#030712";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    function animateChart() {
      isAnimating = true;
      let start = null;
      const duration = 800; // ms

      function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out cubic
        animationProgress = 1 - Math.pow(1 - progress, 3);
        
        drawChart();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          isAnimating = false;
        }
      }
      requestAnimationFrame(step);
    }

    // Trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && animationProgress === 0) {
          animateChart();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(canvas);

    // Wire toggle buttons
    $$(".radar-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === activeSet || isAnimating) return;

        $$(".radar-toggle-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeSet = view;
        animationProgress = 0;
        animateChart();
      });
    });
  }

  /* ==========================================================================
     5. Interactive Terminal Easter Egg
     ========================================================================== */
  function initTerminalEasterEgg() {
    let keyBuffer = "";
    const secretWord = "sanchit";

    document.addEventListener("keydown", (e) => {
      // Ignore keys inside inputs/textareas
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > secretWord.length) {
        keyBuffer = keyBuffer.substring(keyBuffer.length - secretWord.length);
      }

      if (keyBuffer === secretWord) {
        openTerminal();
      }
    });

    function openTerminal() {
      let overlay = $("#terminalOverlay");
      if (!overlay) {
        overlay = createTerminalDOM();
      }
      overlay.classList.add("active");
      const input = $(".terminal-input", overlay);
      if (input) {
        input.focus();
        writeOutput("System initialized. Type 'help' for command options.\n");
      }
    }

    function closeTerminal() {
      const overlay = $("#terminalOverlay");
      if (overlay) {
        overlay.classList.remove("active");
      }
    }

    function createTerminalDOM() {
      const overlay = document.createElement("div");
      overlay.id = "terminalOverlay";
      overlay.className = "terminal-overlay";
      
      overlay.innerHTML = `
        <div class="terminal-window">
          <div class="terminal-bar">
            <span class="terminal-title">SANCHIT_PORTFOLIO_OS v1.0.4</span>
            <div class="terminal-dots">
              <span class="terminal-dot-ctrl terminal-dot-close" title="Close Terminal"></span>
              <span class="terminal-dot-ctrl terminal-dot-minimize"></span>
              <span class="terminal-dot-ctrl terminal-dot-maximize"></span>
            </div>
          </div>
          <div class="terminal-content" id="terminalContent">
            <p>Welcome to Sanchit Goyal's CLI shell. [Build successful]</p>
            <p>Ready...</p>
          </div>
          <div class="terminal-input-line">
            <span class="terminal-prompt">guest@sanchit-portfolio:~$</span>
            <input type="text" class="terminal-input" autocomplete="off" spellcheck="false">
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Event listener for close dot
      $(".terminal-dot-close", overlay).addEventListener("click", closeTerminal);

      // Focus input on body click inside window
      $(".terminal-window", overlay).addEventListener("click", () => {
        $(".terminal-input", overlay).focus();
      });

      // Handle keyboard commands
      const input = $(".terminal-input", overlay);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const commandText = input.value.trim();
          input.value = "";
          handleCommand(commandText);
        } else if (e.key === "Escape") {
          closeTerminal();
        }
      });

      return overlay;
    }

    function handleCommand(cmdLine) {
      const parts = cmdLine.toLowerCase().split(" ");
      const cmd = parts[0];
      
      writeOutput(`<span class="terminal-prompt">guest@sanchit-portfolio:~$</span> ${cmdLine}`);

      if (!cmd) return;

      switch(cmd) {
        case "help":
          writeOutput(
            "Available commands:\n" +
            "  about    - Brief profile info\n" +
            "  skills   - Core technical expertise list\n" +
            "  projects - Highlighted projects list\n" +
            "  hire     - Sanchit's availability details\n" +
            "  clear    - Clear the terminal screen\n" +
            "  exit     - Exit CLI shell"
          );
          break;
        case "about":
          writeOutput(
            "Sanchit Goyal is a B.Tech Computer Science Engineering student specializing in Data Science & Machine Learning at LPU.\n" +
            "Interests: AI Research, predictive modeling, machine learning algorithms, and prompt engineering."
          );
          break;
        case "skills":
          writeOutput(
            "Languages: Python, SQL, JavaScript, C++, Java, R\n" +
            "Frameworks/Libraries: NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, Matplotlib, Seaborn"
          );
          break;
        case "projects":
          writeOutput(
            "1. Pure Python Data Cleaning Recommendation Engine (GitHub)\n" +
            "2. Credit Banking Customer Analysis (GitHub)\n" +
            "Type 'about' for more context or visit the portfolio sections."
          );
          break;
        case "hire":
          writeOutput(
            "Status: Open to Internships, Freelance Work, and research collaborations.\n" +
            "Location: India\n" +
            "Email: contact.sanchitgoyal@gmail.com"
          );
          break;
        case "clear":
          const content = $("#terminalContent");
          if (content) content.innerHTML = "";
          break;
        case "exit":
          closeTerminal();
          break;
        default:
          writeOutput(`Command not found: '${cmd}'. Type 'help' for available commands.`);
      }
    }

    function writeOutput(text) {
      const content = $("#terminalContent");
      if (!content) return;

      const p = document.createElement("p");
      p.innerHTML = text.replace(/\n/g, "<br>");
      content.appendChild(p);

      // Scroll to bottom
      content.scrollTop = content.scrollHeight;
    }
  }

})();
