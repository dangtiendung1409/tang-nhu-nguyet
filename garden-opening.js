/* Khu vườn vẽ bằng nét cong; các bông hoa đổi hình thành bó quà. */
window.GiftGarden = class GiftGarden {
  constructor(canvas, { reducedMotion = false, recipient = "Như Nguyệt", onDraw = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.reducedMotion = reducedMotion;
    this.recipient = recipient;
    this.onDraw = onDraw;
    this.flowers = [];
    this.width = 320;
    this.height = 320;
    this.frame = 0;
    this.mode = "idle";
    this.pointer = null;
    this.previousPoint = null;
    this.seeds = [];
    this.paint = this.paint.bind(this);
    this.palette = ["#d4879e", "#e5b2bb", "#bb99b8", "#e1aa82", "#cc8494", "#e5c4ba"];
    canvas.addEventListener("pointerdown", (event) => {
      if (this.mode !== "blooming") return;
      event.preventDefault();
      this.pointer = event.pointerId;
      this.previousPoint = null;
      canvas.setPointerCapture(event.pointerId);
      this.plantFromPointer(event);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (this.pointer === event.pointerId && this.mode === "blooming") this.plantFromPointer(event);
    });
    const release = () => {
      this.pointer = null;
      this.previousPoint = null;
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("lostpointercapture", release);
    canvas.addEventListener("keydown", (event) => {
      if (this.mode !== "blooming" || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      this.plant(0.2 + Math.random() * 0.6, 0.28 + Math.random() * 0.4);
      this.onDraw();
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !this.ctx) return;
    this.width = bounds.width;
    this.height = bounds.height;
    this.ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    if (this.mode !== "idle") this.requestPaint();
  }

  start() {
    this.stop();
    this.flowers = [];
    this.canvas.dataset.flowers = "0";
    this.mode = "blooming";
    this.canvas.dataset.mode = this.mode;
    this.startedAt = performance.now();
    this.seeds = [{ at: 100, u: 0.25, v: 0.52 }, { at: 380, u: 0.5, v: 0.32 }, { at: 670, u: 0.76, v: 0.57 }];
    this.resize();
    if (this.reducedMotion) {
      this.seeds.forEach(({ u, v }) => this.plant(u, v));
      this.seeds = [];
    }
    this.requestPaint();
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.pointer !== null && this.canvas.hasPointerCapture(this.pointer)) this.canvas.releasePointerCapture(this.pointer);
    this.pointer = null;
    this.previousPoint = null;
    this.mode = "idle";
  }

  requestPaint() {
    if (!this.ctx || this.frame || this.mode === "idle") return;
    this.frame = requestAnimationFrame(this.paint);
  }

  plantFromPointer(event) {
    const bounds = this.canvas.getBoundingClientRect();
    const x = Math.max(25, Math.min(bounds.width - 25, event.clientX - bounds.left));
    const y = Math.max(35, Math.min(bounds.height - 67, event.clientY - bounds.top));
    if (this.previousPoint && Math.hypot(x - this.previousPoint.x, y - this.previousPoint.y) < 27) return;
    this.previousPoint = { x, y };
    this.plant(x / bounds.width, y / bounds.height);
    this.onDraw();
  }

  plant(u, v) {
    if (this.flowers.length >= 36 || this.mode !== "blooming") return;
    const index = this.flowers.length;
    this.flowers.push({ u, v, size: 14 + (index * 7) % 9, kind: index % 3, angle: (index % 5 - 2) * 0.16, born: performance.now(), color: this.palette[index % this.palette.length], curve: Math.sin(index * 2.4) * 26 });
    this.canvas.dataset.flowers = String(this.flowers.length);
    this.requestPaint();
  }

  gather() {
    if (this.mode !== "blooming") return;
    while (this.flowers.length < 9) {
      const index = this.flowers.length;
      this.plant(0.18 + (index * 0.173) % 0.65, 0.23 + (index * 0.137) % 0.46);
    }
    this.seeds = [];
    if (this.pointer !== null && this.canvas.hasPointerCapture(this.pointer)) this.canvas.releasePointerCapture(this.pointer);
    this.pointer = null;
    this.mode = "gathering";
    this.canvas.dataset.mode = this.mode;
    this.gatheredAt = performance.now();
    this.requestPaint();
  }

  ease(value) {
    const t = Math.max(0, Math.min(1, value));
    return 1 - Math.pow(1 - t, 3);
  }

  paint(now) {
    this.frame = 0;
    if (!this.ctx || this.mode === "idle") return;
    while (this.seeds.length && now - this.startedAt >= this.seeds[0].at) {
      const { u, v } = this.seeds.shift();
      this.plant(u, v);
    }
    // plant() can request a frame; this paint owns the next scheduling decision.
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    const c = this.ctx;
    const w = this.width;
    const h = this.height;
    c.setTransform(this.ratio || 1, 0, 0, this.ratio || 1, 0, 0);
    c.clearRect(0, 0, w, h);
    const gathering = this.mode === "gathering" || this.mode === "bouquet";
    const progress = gathering ? (this.reducedMotion ? 1 : Math.min(1, (now - this.gatheredAt) / 1800)) : 0;
    const move = this.ease(progress);
    if (gathering) this.drawWrapping(progress);
    else this.drawGround();
    const positions = this.flowers.map((flower, index) => {
      const angle = index * 2.39996 + (flower.u - 0.5) * 0.6;
      const radius = Math.sqrt((index + 0.5) / this.flowers.length) * Math.min(w * 0.28, h * 0.25) * (0.9 + flower.v * 0.18);
      const targetX = w * 0.5 + Math.cos(angle) * radius;
      const targetY = h * 0.34 + Math.sin(angle) * radius * 0.8;
      const age = this.reducedMotion || gathering ? 1 : this.ease((now - flower.born) / 1000);
      const arc = Math.sin(move * Math.PI);
      const x = flower.u * w * (1 - move) + targetX * move + arc * Math.sin(index * 1.7) * 20;
      const y = flower.v * h * (1 - move) + targetY * move - arc * 25;
      const baseX = (flower.u * w + flower.curve) * (1 - move) + w * 0.5 * move;
      const baseY = Math.min(h * 0.89, flower.v * h + 100) * (1 - move) + h * 0.76 * move;
      return { flower, x, y, baseX, baseY, age };
    });
    positions.forEach((point) => this.drawStem(point, move));
    positions.forEach(({ flower, x, y, age }) => {
      const bloom = gathering ? 1 : this.ease((age - 0.25) / 0.75);
      this.drawBloom(x, y, flower, bloom, move);
    });
    if (gathering) this.drawBow(progress);
    if (gathering && progress >= 1) {
      this.mode = "bouquet";
      this.canvas.dataset.mode = this.mode;
    }
    const growing = this.flowers.some((flower) => now - flower.born < 1200);
    if ((!this.reducedMotion && (growing || this.seeds.length)) || (this.mode === "gathering" && progress < 1)) this.requestPaint();
  }

  drawGround() {
    const c = this.ctx;
    c.save();
    c.strokeStyle = "#d9cab477";
    c.lineWidth = 1;
    c.setLineDash([2, 6]);
    c.beginPath();
    c.moveTo(this.width * 0.08, this.height * 0.9);
    c.quadraticCurveTo(this.width * 0.5, this.height * 0.94, this.width * 0.92, this.height * 0.9);
    c.stroke();
    c.restore();
  }

  drawStem({ flower, x, y, baseX, baseY, age }, move) {
    const c = this.ctx;
    const stem = this.ease(age * 1.6);
    const headX = baseX + (x - baseX) * stem;
    const headY = baseY + (y - baseY) * stem;
    c.save();
    c.strokeStyle = "#7d9878";
    c.lineWidth = 1.6;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(baseX, baseY);
    c.quadraticCurveTo(baseX + flower.curve * (1 - move), (headY + baseY) * 0.5, headX, headY);
    c.stroke();
    if (age > 0.35) {
      const leafX = baseX + (x - baseX) * 0.35;
      const leafY = baseY + (y - baseY) * 0.35;
      c.globalAlpha = Math.min(1, (age - 0.35) * 3);
      c.fillStyle = "#a8b89a";
      c.beginPath();
      c.moveTo(leafX, leafY);
      c.bezierCurveTo(leafX - 24, leafY - 23, leafX - 24, leafY - 5, leafX, leafY);
      c.fill();
      c.fillStyle = "#8da787";
      c.beginPath();
      c.moveTo(leafX, leafY - 12);
      c.bezierCurveTo(leafX + 24, leafY - 35, leafX + 19, leafY - 12, leafX, leafY - 12);
      c.fill();
    }
    c.restore();
  }

  drawBloom(x, y, flower, progress, move) {
    if (progress <= 0) return;
    const c = this.ctx;
    const size = flower.size * (1 - move * 0.08);
    c.save();
    c.translate(x, y);
    c.rotate(flower.angle * progress);
    c.scale(progress, progress);
    c.fillStyle = flower.color;
    if (flower.kind === 1) {
      [-0.48, 0.48, 0].forEach((angle, index) => {
        c.save(); c.rotate(angle); c.globalAlpha = index === 2 ? 0.95 : 0.78;
        c.beginPath(); c.moveTo(0, size * 0.4);
        c.bezierCurveTo(-size, size * 0.1, -size * 0.6, -size * 1.1, 0, -size * 1.25);
        c.bezierCurveTo(size * 0.6, -size * 1.1, size, size * 0.1, 0, size * 0.4);
        c.fill(); c.restore();
      });
    } else {
      const petals = flower.kind === 0 ? 8 : 5;
      for (let i = 0; i < petals; i++) {
        c.save(); c.rotate(i * Math.PI * 2 / petals + (1 - progress) * 0.7);
        c.globalAlpha = i % 2 ? 0.82 : 0.96;
        c.beginPath(); c.ellipse(0, -size * 0.53, size * (flower.kind === 0 ? 0.3 : 0.46), size * 0.65, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
      c.fillStyle = "#d6a15e"; c.beginPath(); c.arc(0, 0, size * 0.24, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#fff4d6"; c.beginPath(); c.arc(-size * 0.05, -size * 0.06, size * 0.07, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  drawWrapping(progress) {
    const c = this.ctx;
    const w = this.width;
    const h = this.height;
    c.save();
    c.globalAlpha = this.ease((progress - 0.35) / 0.65);
    c.fillStyle = "#ecd6c3";
    c.beginPath(); c.moveTo(w * 0.2, h * 0.41); c.lineTo(w * 0.5, h * 0.94); c.lineTo(w * 0.8, h * 0.41); c.lineTo(w * 0.51, h * 0.54); c.closePath(); c.fill();
    c.fillStyle = "#f5e6d5";
    c.beginPath(); c.moveTo(w * 0.18, h * 0.44); c.lineTo(w * 0.49, h * 0.94); c.lineTo(w * 0.43, h * 0.55); c.closePath(); c.fill();
    c.fillStyle = "#dfbda9";
    c.beginPath(); c.moveTo(w * 0.82, h * 0.44); c.lineTo(w * 0.51, h * 0.94); c.lineTo(w * 0.6, h * 0.55); c.closePath(); c.fill();
    c.restore();
  }

  drawBow(progress) {
    const c = this.ctx;
    const x = this.width * 0.5;
    const y = this.height * 0.74;
    c.save();
    c.globalAlpha = this.ease((progress - 0.65) / 0.35);
    c.strokeStyle = "#b97e96"; c.lineWidth = 4; c.lineCap = "round";
    c.beginPath(); c.moveTo(x, y);
    c.bezierCurveTo(x - 55, y - 37, x - 48, y + 19, x, y);
    c.bezierCurveTo(x + 55, y - 37, x + 48, y + 19, x, y);
    c.moveTo(x, y); c.quadraticCurveTo(x - 6, y + 19, x - 24, y + 34);
    c.moveTo(x, y); c.quadraticCurveTo(x + 6, y + 22, x + 24, y + 31); c.stroke();
    c.fillStyle = "#fffaf0"; c.translate(x + 18, y + 12); c.rotate(-0.16); c.fillRect(0, 0, 78, 26);
    c.strokeStyle = "#dfc8bb"; c.lineWidth = 0.7; c.strokeRect(0, 0, 78, 26);
    c.fillStyle = "#9f607b"; c.font = '12px Georgia, serif'; c.textAlign = "center"; c.fillText(this.recipient, 39, 17, 72);
    c.restore();
  }
};
