// Name personalization
const nameInput = document.getElementById('nameInput');
const recipientName = document.getElementById('recipientName');
const wishBtn = document.getElementById('wishBtn');
const sendBtn = document.getElementById('sendBtn');

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
function blowOutAndCelebrate() {
  // Toggle flames off and celebrate
  document.querySelectorAll('.flame').forEach((f) => {
    f.animate([
      { opacity: 1, transform: 'translateX(-50%) scale(1) rotate(0deg)' },
      { opacity: 0, transform: 'translateX(-60%) scale(.2) rotate(-20deg)' }
    ], { duration: 500, easing: 'ease-out' }).onfinish = () => {
      f.style.display = 'none';
    };
  });
  startConfetti();
}

// Optional: Server endpoint that will send the email on your behalf
// For Google Apps Script Web App, paste the deployed URL here
const SEND_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyWUJxg0aQ2G9_npbmjyYmLmHS2kb68y8crm4wJ897zjdEhWlVnhgPZIZ92d4JDdrrP/exec';

// (Legacy optional) EmailJS config — not used when SEND_ENDPOINT is set
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

function getCurrentName() {
  const typed = (nameInput?.value || '').trim();
  if (typed) return typed;
  const shown = (document.getElementById('recipientName')?.textContent || '').trim();
  return shown || 'Friend';
}

// Send name via server endpoint (preferred)
function sendNameByEmail() {
  const name = getCurrentName();
  blowOutAndCelebrate();

  if (SEND_ENDPOINT && SEND_ENDPOINT.startsWith('http')) {
    // prevent duplicate sends
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.setAttribute('aria-busy', 'true');
      sendBtn.textContent = 'Sending…';
    }

    fetch(SEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: `name=${encodeURIComponent(name)}`
    })
      .then(async (res) => {
        const text = await res.text();
        // Accept either JSON {ok:true} or plain OK
        let ok = res.ok;
        try {
          const parsed = JSON.parse(text);
          ok = ok && parsed && parsed.ok === true;
        } catch (_) {
          ok = ok && /^(OK|ok)$/i.test(text.trim());
        }
        if (!ok) throw new Error(text || `HTTP ${res.status}`);
        alert('Sent! Happy Birthday 🎉');
      })
      .catch((err) => {
        console.error('Send endpoint error', err);
        alert(`Could not send automatically. ${err?.message || ''}`.trim());
      })
      .finally(() => {
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.removeAttribute('aria-busy');
          sendBtn.textContent = 'Send Name';
        }
      });
    return;
  }

  // Fallback to EmailJS if configured
  if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    const templateParams = { to_email: 'felmola13@gmail.com', name };
    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => alert('Sent! Happy Birthday 🎉'))
      .catch((err) => {
        console.error('EmailJS error', err);
        alert('Could not send automatically. Please try again later.');
      });
    return;
  }

  alert('Configure SEND_ENDPOINT to send automatically from Gmail.');
}

if (sendBtn) {
  sendBtn.addEventListener('click', sendNameByEmail);
}

if (nameInput) {
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendNameByEmail();
    }
  });
}


