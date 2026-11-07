/**
 * Canvas Confetti Cannon
 * Particules de célébration or et couleurs vives. Zéro dépendance.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
}

export function fireGoldConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "99999";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#F59E0B", "#FCD34D", "#10B981", "#EC4899", "#3B82F6", "#FFFFFF", "#FBBF24"];
  const particles: Particle[] = [];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2.2;

  for (let i = 0; i < 90; i++) {
    const angle = (Math.PI * 2 * i) / 90 + (Math.random() - 0.5) * 0.4;
    const speed = 6 + Math.random() * 12;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    });
  }

  let animationFrame: number;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > 2400) {
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Gravité
      p.vx *= 0.98; // Friction
      p.rotation += p.vRot;
      p.alpha = Math.max(0, 1 - elapsed / 2400);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }

    animationFrame = requestAnimationFrame(animate);
  }

  animate();
}
