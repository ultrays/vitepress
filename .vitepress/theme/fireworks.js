// 烟花效果脚本
class Fireworks {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.fireworks = [];
    this.mouse = { x: 0, y: 0, clicked: false };
    // 更鲜艳的颜色数组
    this.colors = ['#ff3b30', '#00cc66', '#007aff', '#ff9500', '#5856d6', '#ff2d55', '#4cd964', '#ffcc00'];
    // 初始化音频上下文
    this.audioContext = null;
    this.init();
    this.initAudio();
    this.bindEvents();
    this.animate();
  }

  init() {
    // 创建canvas元素
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);
    this.resize();
  }

  initAudio() {
    // 初始化音频上下文
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('click', (e) => {
      // 确保音频上下文在用户交互时激活（浏览器安全策略）
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.clicked = true;
      this.createFirework();
    });
  }

  createFirework() {
    const firework = {
      x: this.canvas.width / 2,
      y: this.canvas.height,
      targetX: this.mouse.x,
      targetY: this.mouse.y,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      radius: 2,
      speed: 8,
      angle: Math.atan2(this.mouse.y - this.canvas.height, this.mouse.x - this.canvas.width / 2),
      exploded: false,
      particles: []
    };
    this.fireworks.push(firework);
    // 播放烟花发射音效
    this.playLaunchSound();
  }

  updateFirework(firework) {
    // 计算到目标点的距离
    const dx = firework.targetX - firework.x;
    const dy = firework.targetY - firework.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 移动烟花
    firework.x += Math.cos(firework.angle) * firework.speed;
    firework.y += Math.sin(firework.angle) * firework.speed;

    // 检查是否到达目标点
    if (distance < 50) {
      firework.exploded = true;
      this.createParticles(firework);
    }
  }

  createParticles(firework) {
    const particleCount = 70; // 增加粒子数量
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        x: firework.targetX,
        y: firework.targetY,
        color: firework.color,
        radius: Math.random() * 3 + 2, // 增加粒子大小
        speed: Math.random() * 6 + 3, // 增加粒子速度
        angle: (Math.PI * 2 * i) / particleCount,
        friction: 0.93, // 减少摩擦，让粒子飞更远
        gravity: 0.15, // 减少重力影响
        opacity: 1,
        fade: Math.random() * 0.015 + 0.008 // 减慢淡出速度，让粒子更持久
      };
      firework.particles.push(particle);
      this.particles.push(particle);
    }
    // 播放烟花爆炸音效
    this.playExplosionSound();
    // 添加页面晃动效果
    this.addShakeEffect();
  }

  playLaunchSound() {
    if (!this.audioContext) return;
    
    // 创建发射音效 - 低频率上升音
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playExplosionSound() {
    if (!this.audioContext) return;
    
    // 创建爆炸音效 - 多个频率同时发声
    const explosionCount = 8;
    const baseTime = this.audioContext.currentTime;
    
    for (let i = 0; i < explosionCount; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 随机频率和波形
      const types = ['sine', 'square', 'sawtooth', 'triangle'];
      oscillator.type = types[Math.floor(Math.random() * types.length)];
      
      // 随机频率范围
      const frequency = Math.random() * 800 + 200;
      oscillator.frequency.setValueAtTime(frequency, baseTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, baseTime + 0.5);
      
      // 音量包络
      gainNode.gain.setValueAtTime(0, baseTime);
      gainNode.gain.exponentialRampToValueAtTime(0.2, baseTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.5);
      
      // 随机延迟
      const delay = Math.random() * 0.1;
      oscillator.start(baseTime + delay);
      oscillator.stop(baseTime + delay + 0.5);
    }
  }

  // 添加页面晃动效果
  addShakeEffect() {
    const body = document.body;
    // 移除可能存在的旧动画类，确保可以重新触发
    body.classList.remove('shake-animation');
    // 触发重排
    void body.offsetWidth;
    // 添加动画类
    body.classList.add('shake-animation');
    
    // 动画结束后移除类
    setTimeout(() => {
      body.classList.remove('shake-animation');
    }, 500);
  }

  updateParticle(particle) {
    particle.x += Math.cos(particle.angle) * particle.speed;
    particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
    particle.speed *= particle.friction;
    particle.opacity -= particle.fade;
  }

  drawFirework(firework) {
    this.ctx.save();
    this.ctx.globalAlpha = 1;
    // 增加烟花主体的大小和亮度
    this.ctx.beginPath();
    this.ctx.arc(firework.x, firework.y, firework.radius + 1, 0, Math.PI * 2);
    this.ctx.fillStyle = firework.color;
    this.ctx.fill();
    // 添加光晕效果
    this.ctx.globalAlpha = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(firework.x, firework.y, firework.radius + 3, 0, Math.PI * 2);
    this.ctx.fillStyle = firework.color;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawParticle(particle) {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    // 绘制粒子主体
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();
    // 添加粒子光晕，增强亮度效果
    this.ctx.globalAlpha = particle.opacity * 0.6;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.radius + 2, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    // 清空画布 - 使用完全透明的背景，只清除粒子轨迹
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和绘制烟花
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const firework = this.fireworks[i];
      if (!firework.exploded) {
        this.updateFirework(firework);
        this.drawFirework(firework);
      } else {
        this.fireworks.splice(i, 1);
      }
    }

    // 更新和绘制粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      this.updateParticle(particle);
      this.drawParticle(particle);
      if (particle.opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// 导出烟花类
export default Fireworks;