// Name personalization
const nameInput = document.getElementById('nameInput');
const recipientName = document.getElementById('recipientName');
const wishBtn = document.getElementById('wishBtn');

if (nameInput && recipientName) {
  nameInput.addEventListener('input', () => {
    const val = nameInput.value.trim();
    recipientName.textContent = val.length ? val : 'Friend';
  });
}

// Candle flames subtle brightness sync (extra glow on hover)
document.addEventListener('mousemove', (e) => {
  const flames = document.querySelectorAll('.flame');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const intensity = Math.min(1.15, 1 + Math.hypot(dx, dy) * 0.06);
  flames.forEach((f) => {
    f.style.filter = `brightness(${intensity})`;
  });
});

// Confetti implementation
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let confettiPieces = [];
let rafId = null;

function resizeCanvas() {
  if (!canvas) return;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function random(min, max) { return Math.random() * (max - min) + min; }

function createConfetti(count = 160) {
  const colors = ['#FF4D94', '#FFB84D', '#6C63FF', '#4DD0E1', '#FFD166'];
  confettiPieces = Array.from({ length: count }, () => ({
    x: random(0, window.innerWidth),
    y: random(-window.innerHeight * 0.3, -20),
    r: random(4, 10),
    tilt: random(-10, 10),
    tiltAngle: random(0, Math.PI * 2),
    tiltAngleInc: random(0.02, 0.06),
    color: colors[Math.floor(random(0, colors.length))],
    speed: random(1.4, 2.5),
    sway: random(0.6, 1.4)
  }));
}

function drawConfetti() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of confettiPieces) {
    p.tiltAngle += p.tiltAngleInc;
    p.y += p.speed;
    p.x += Math.sin(p.tiltAngle) * p.sway;
    p.tilt = Math.sin(p.tiltAngle) * 12;
    if (p.y > window.innerHeight + 20) {
      p.y = random(-40, -10);
      p.x = random(0, window.innerWidth);
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.tiltAngle, 0, Math.PI * 2);
    ctx.fill();
  }
  rafId = requestAnimationFrame(drawConfetti);
}

function startConfetti() {
  if (!canvas) return;
  resizeCanvas();
  createConfetti();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(drawConfetti);
  setTimeout(stopConfetti, 6000);
}

function stopConfetti() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces = [];
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Wish button: blow out effect
if (wishBtn) {
  wishBtn.addEventListener('click', () => {
    const pressed = wishBtn.getAttribute('aria-pressed') === 'true';
    wishBtn.setAttribute('aria-pressed', String(!pressed));
    // Toggle flames
    document.querySelectorAll('.flame').forEach((f) => {
      if (pressed) {
        f.style.display = '';
      } else {
        f.animate([
          { opacity: 1, transform: 'translateX(-50%) scale(1) rotate(0deg)' },
          { opacity: 0, transform: 'translateX(-60%) scale(.2) rotate(-20deg)' }
        ], { duration: 500, easing: 'ease-out' }).onfinish = () => {
          f.style.display = 'none';
        };
      }
    });
    if (!pressed) startConfetti();
  });
}


