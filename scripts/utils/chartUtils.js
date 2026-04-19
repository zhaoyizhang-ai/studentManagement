export function drawDonut(canvas, data, colors) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 16;
  const innerR = r * 0.58;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) {
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
    ctx.fill();
    return;
  }
  let start = -Math.PI / 2;
  data.forEach((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff';
  ctx.fill();

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#000';
  ctx.font = `bold ${Math.round(r * 0.3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy);
}

export function drawLine(canvas, labels, values, color = '#6366f1') {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const padL = 32, padR = 16, padT = 16, padB = 32;
  const gW = W - padL - padR;
  const gH = H - padT - padB;
  const max = Math.max(...values, 1);
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#888';

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + gH - (i / 4) * gH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + gW, y);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round((i / 4) * max), padL - 4, y + 4);
  }

  const pts = values.map((v, i) => ({
    x: padL + (i / (values.length - 1 || 1)) * gW,
    y: padT + gH - (v / max) * gH,
  }));

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  ctx.fillStyle = color + '33';
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, padT + gH);
  ctx.lineTo(pts[0].x, padT + gH);
  ctx.closePath();
  ctx.fill();

  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], p.x, padT + gH + 16);
  });
}

export function drawBar(canvas, labels, values, doneValues, colors) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const padL = 36, padR = 16, padT = 16, padB = 40;
  const gW = W - padL - padR;
  const gH = H - padT - padB;
  const max = Math.max(...values, 1);
  const n = labels.length;
  const barGroup = gW / n;
  const barW = Math.min(barGroup * 0.35, 24);
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#888';

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + gH - (i / 4) * gH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + gW, y);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round((i / 4) * max), padL - 4, y + 4);
  }

  labels.forEach((label, i) => {
    const cx = padL + i * barGroup + barGroup / 2;
    const totalH = (values[i] / max) * gH;
    const doneH = (doneValues[i] / max) * gH;

    ctx.fillStyle = colors[i % colors.length] + '55';
    ctx.beginPath();
    ctx.roundRect(cx - barW - 2, padT + gH - totalH, barW, totalH, 3);
    ctx.fill();

    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.roundRect(cx + 2, padT + gH - doneH, barW, doneH, 3);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const shortLabel = label.length > 4 ? label.slice(0, 4) : label;
    ctx.fillText(shortLabel, cx, padT + gH + 16);
  });
}
