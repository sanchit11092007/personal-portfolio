const particleReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#particleCanvas");
  if (!canvas || particleReduced) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const pointer = { x: -9999, y: -9999, active: false };
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = 0;
  let running = true;

  const palette = [
    "rgba(34, 211, 238, 0.64)",
    "rgba(139, 92, 246, 0.58)",
    "rgba(52, 211, 153, 0.48)",
    "rgba(251, 191, 36, 0.34)"
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function createParticles() {
    particles.length = 0;
    const density = width < 640 ? 0.00007 : 0.000105;
    const count = Math.min(96, Math.max(38, Math.floor(width * height * density)));

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        radius: Math.random() * 1.6 + 0.65,
        color: palette[index % palette.length]
      });
    }
  }

  function draw() {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 120 && distance > 0) {
          const force = (120 - distance) / 120;
          p.x += (dx / distance) * force * 0.42;
          p.y += (dy / distance) * force * 0.42;
        }
      }

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const next = particles[j];
        const dx = p.x - next.x;
        const dy = p.y - next.y;
        const distance = dx * dx + dy * dy;
        const maxDistance = width < 640 ? 92 : 124;

        if (distance < maxDistance * maxDistance) {
          const opacity = 1 - distance / (maxDistance * maxDistance);
          ctx.strokeStyle = `rgba(125, 211, 252, ${opacity * 0.14})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }
    }

    frameId = requestAnimationFrame(draw);
  }

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

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      frameId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(frameId);
    }
  });

  resize();
  draw();
});
