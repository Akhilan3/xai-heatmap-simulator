const canvas = document.getElementById('simulator-canvas');
const ctx = canvas.getContext('2d');

const envNameEl = document.getElementById('env-name');
const switchEnvBtn = document.getElementById('switch-env-btn');
const focusAreaEl = document.getElementById('focus-area');
const statusBadgeEl = document.getElementById('status-badge');
const modeBtns = document.querySelectorAll('.mode-btn');

const environments = ['Office Wallpaper', 'Studio Backdrop', 'Dynamic Outdoor Light'];
let currentEnvIdx = 0;
let currentMode = 'stacked';

const modeConfigs = {
  raw: {
    focus: 'Full Frame Visual Input',
    badgeText: 'UNFILTERED',
    badgeClass: 'neutral',
    heatmapPos: null
  },
  shortcut: {
    focus: 'Background Texture & Wallpaper',
    badgeText: 'SHORTCUT DETECTED',
    badgeClass: 'cheat',
    heatmapPos: { x: 460, y: 110, radius: 85, color: 'rgba(239, 68, 68, 0.65)' }
  },
  saliency: {
    focus: 'Edge Contrast Pixels',
    badgeText: 'UNSTABLE FOCUS',
    badgeClass: 'cheat',
    heatmapPos: { x: 350, y: 180, radius: 70, color: 'rgba(245, 158, 11, 0.6)' }
  },
  cam: {
    focus: 'Broad Bounding Region',
    badgeText: 'COARSE FOCUS',
    badgeClass: 'neutral',
    heatmapPos: { x: 300, y: 220, radius: 120, color: 'rgba(59, 130, 246, 0.5)' }
  },
  gradcam: {
    focus: 'Palm & Metacarpals',
    badgeText: 'PARTIAL FOCUS',
    badgeClass: 'validated',
    heatmapPos: { x: 300, y: 240, radius: 75, color: 'rgba(16, 185, 129, 0.55)' }
  },
  stacked: {
    focus: 'Finger Joints & Articulation',
    badgeText: 'VALIDATED FOCUS',
    badgeClass: 'validated',
    heatmapPos: { x: 270, y: 170, radius: 55, color: 'rgba(16, 185, 129, 0.75)' }
  }
};

const joints = {
  wrist: { x: 300, y: 300 },
  thumb: [{ x: 280, y: 270 }, { x: 260, y: 240 }, { x: 250, y: 210 }],
  index: [{ x: 290, y: 250 }, { x: 280, y: 200 }, { x: 270, y: 170 }],
  middle: [{ x: 300, y: 240 }, { x: 300, y: 180 }, { x: 325, y: 160 }],
  ring: [{ x: 310, y: 250 }, { x: 330, y: 200 }, { x: 350, y: 180 }],
  pinky: [{ x: 320, y: 260 }, { x: 345, y: 225 }, { x: 365, y: 195 }]
};

function drawGrid() {
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;

  const gridSize = 25;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawHeatmap(config) {
  if (!config.heatmapPos) return;

  const { x, y, radius, color } = config.heatmapPos;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkeleton() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  Object.keys(joints).forEach(finger => {
    if (finger === 'wrist') return;
    let prev = joints.wrist;
    joints[finger].forEach(point => {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      prev = point;
    });
  });

  ctx.fillStyle = '#38bdf8';
  const allPoints = [
    joints.wrist,
    ...joints.thumb,
    ...joints.index,
    ...joints.middle,
    ...joints.ring,
    ...joints.pinky
  ];

  allPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function render() {
  drawGrid();
  const config = modeConfigs[currentMode];
  drawHeatmap(config);
  drawSkeleton();

  focusAreaEl.textContent = config.focus;
  statusBadgeEl.textContent = config.badgeText;
  statusBadgeEl.className = `badge ${config.badgeClass}`;
}

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    render();
  });
});

switchEnvBtn.addEventListener('click', () => {
  currentEnvIdx = (currentEnvIdx + 1) % environments.length;
  envNameEl.textContent = environments[currentEnvIdx];
  render();
});

render();
