// ── Theme Switch Logic ────────────────────────────────────────
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('themeToggleBtn').innerHTML = newTheme === 'dark' 
    ? `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    : `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  
  if (currentUser) {
    const raw = localStorage.getItem('profile_' + currentUser.u);
    if (raw) {
      const profile = JSON.parse(raw);
      changeAccentColor(profile.accent || 'indigo', true);
    }
  }
  
  if (document.getElementById('page_analiz').classList.contains('active')) {
    renderCharts();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeToggleBtn').innerHTML = savedTheme === 'dark'
    ? `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    : `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
}

// ── Extreme Visual Feast & Energy Mode Engine ──────────────────
let energyMode = 'enabled'; // 'enabled' (Optimization ON) or 'disabled' (Extreme ON)
let particleAnimationId = null;
const extremeCanvas = document.getElementById('extremeCanvas');
const ctx = extremeCanvas ? extremeCanvas.getContext('2d') : null;
let particles = [];
const mouse = { x: null, y: null, radius: 150 };

function initEnergyMode() {
  const saved = localStorage.getItem('energyMode') || 'enabled';
  energyMode = saved;
  const btn = document.getElementById('energyToggleBtn');
  
  if (energyMode === 'disabled') {
    document.body.classList.add('extreme-active');
    if (btn) {
      btn.classList.add('extreme-mode-btn');
      btn.classList.remove('eco-mode-btn');
      btn.title = 'Görsel Şölen Modu (Kapatmak için tıklayın)';
    }
    startParticles();
    bindExtremeEvents();
  } else {
    document.body.classList.remove('extreme-active');
    if (btn) {
      btn.classList.add('eco-mode-btn');
      btn.classList.remove('extreme-mode-btn');
      btn.title = 'Optimizasyon Modu (Açmak için tıklayın)';
    }
    stopParticles();
    unbindExtremeEvents();
  }
}

function toggleEnergyMode() {
  if (energyMode === 'enabled') {
    energyMode = 'disabled';
    showToast('Optimizasyon Modu Kapalı! 🚀', 'info');
  } else {
    energyMode = 'enabled';
    showToast('Optimizasyon Modu Devrede (Enerji Tasarrufu). ⚡', 'success');
  }
  localStorage.setItem('energyMode', energyMode);
  initEnergyMode();
}

// Particles Class & Engine
class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.radius = Math.random() * 3 + 1;
    this.color = document.documentElement.getAttribute('data-theme') === 'dark' ? 
      `rgba(99, 102, 241, ${Math.random() * 0.4 + 0.1})` : 
      `rgba(79, 70, 229, ${Math.random() * 0.2 + 0.05})`;
  }
  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    // Interactive mouse repulsion
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < mouse.radius) {
        let force = (mouse.radius - dist) / mouse.radius;
        this.x -= dx / dist * force * 3;
        this.y -= dy / dist * force * 3;
      }
    }
  }
  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
  }
}

function resizeCanvas() {
  if (!extremeCanvas) return;
  extremeCanvas.width = window.innerWidth;
  extremeCanvas.height = window.innerHeight;
}

function animateParticles() {
  if (!ctx || !extremeCanvas) return;
  const w = extremeCanvas.width;
  const h = extremeCanvas.height;
  ctx.clearRect(0, 0, w, h);

  // Drawing and connecting nodes
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(w, h);
    particles[i].draw(ctx);
    
    // Draw lines between close particles for digital neural network effect
    for (let j = i + 1; j < particles.length; j++) {
      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        let alpha = (100 - dist) / 100 * 0.15;
        ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 
          `rgba(167, 139, 250, ${alpha})` : 
          `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  particleAnimationId = requestAnimationFrame(animateParticles);
}

function startParticles() {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  particles = [];
  const count = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(extremeCanvas.width, extremeCanvas.height));
  }
  if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
  animateParticles();
}

function stopParticles() {
  window.removeEventListener('resize', resizeCanvas);
  if (particleAnimationId) {
    cancelAnimationFrame(particleAnimationId);
    particleAnimationId = null;
  }
  if (ctx && extremeCanvas) {
    ctx.clearRect(0, 0, extremeCanvas.width, extremeCanvas.height);
  }
}

// mousemove events for custom trail & 3D tilt
let cursorTrailEl = document.getElementById('extremeTrail');

function extremeMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  
  if (cursorTrailEl) {
    cursorTrailEl.style.left = e.clientX + 'px';
    cursorTrailEl.style.top = e.clientY + 'px';
  }
}

function extremeMouseLeave() {
  mouse.x = null;
  mouse.y = null;
}

function cardTiltMove(e) {
  if (energyMode === 'enabled') return;
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  
  // Custom extreme tilt bounds
  const rotateX = ((yc - y) / yc) * 12; // tilt max 12 deg
  const rotateY = ((x - xc) / xc) * 12;
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
  card.style.boxShadow = `0 20px 40px rgba(99, 102, 241, 0.3), 0 0 30px rgba(167, 139, 250, 0.2)`;
}

function cardTiltLeave(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  card.style.boxShadow = '';
}

function bindExtremeEvents() {
  window.addEventListener('mousemove', extremeMouseMove);
  window.addEventListener('mouseleave', extremeMouseLeave);
  
  // Select cards dynamically and bind hover 3D effects
  setTimeout(() => {
    const cards = document.querySelectorAll('.stat-card, .chart-card, .panel-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', cardTiltMove);
      card.addEventListener('mouseleave', cardTiltLeave);
    });
  }, 1000); // Wait slightly for DOM loading
}

function unbindExtremeEvents() {
  window.removeEventListener('mousemove', extremeMouseMove);
  window.removeEventListener('mouseleave', extremeMouseLeave);
  
  const cards = document.querySelectorAll('.stat-card, .chart-card, .panel-card');
  cards.forEach(card => {
    card.removeEventListener('mousemove', cardTiltMove);
    card.removeEventListener('mouseleave', cardTiltLeave);
    card.style.transform = '';
    card.style.boxShadow = '';
  });
}

// ── Event listeners ───────────────────────────────────────────
document.getElementById('modalBg').addEventListener('click',function(e){if(e.target===this)closeModal();});
document.getElementById('kesifModalBg').addEventListener('click',function(e){if(e.target===this)closeKesifModal();});
document.getElementById('userEditModalBg').addEventListener('click',function(e){if(e.target===this)closeUserEditModal();});
document.getElementById('approveModalBg').addEventListener('click',function(e){if(e.target===this)closeApproveModal();});
document.getElementById('hakedisModalBg').addEventListener('click',function(e){if(e.target===this)closeHakedisModal();});
document.getElementById('invoiceModalBg').addEventListener('click',function(e){if(e.target===this)closeInvoiceModal();});
document.getElementById('li_p').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('li_u').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('li_p').focus();});

document.getElementById('f_bas').addEventListener('change', function() {
  document.getElementById('f_bit').min = this.value;
});
document.getElementById('f_bit').addEventListener('change', function() {
  document.getElementById('f_bas').max = this.value;
});

// Double click to inline edit in table
document.getElementById('tbody').addEventListener('dblclick', function(e) {
  const cell = e.target.closest('.editable-cell');
  if (!cell) return;
  if (cell.classList.contains('editing')) return;
  
  const id = cell.getAttribute('data-id');
  const field = cell.getAttribute('data-field');
  const it = items.find(x => x.id === id);
  if (!it) return;
  
  cell.classList.add('editing');
  const textDiv = cell.querySelector('.cell-text');
  const originalValue = it[field] || '';
  
  const input = document.createElement('input');
  input.type = (field === 'ttut' || field === 'otut') ? 'number' : 'text';
  if (input.type === 'number') input.step = '0.01';
  input.value = originalValue;
  input.className = 'inline-edit-input';
  input.style.width = '100%';
  input.style.padding = '6px 10px';
  input.style.border = '2px solid var(--primary)';
  input.style.borderRadius = '8px';
  input.style.font = 'inherit';
  input.style.color = 'var(--text)';
  input.style.background = 'var(--card)';
  input.style.outline = 'none';
  
  // Temporarily swap content
  textDiv.innerHTML = '';
  textDiv.appendChild(input);
  input.focus();
  
  const finishEdit = async (save) => {
    if (!cell.classList.contains('editing')) return;
    cell.classList.remove('editing');
    
    if (save) {
      let newValue = input.value.trim();
      if (field === 'ttut' || field === 'otut') {
        const num = Number(newValue) || 0;
        newValue = num >= 0 ? String(num) : '0';
      }
      
      if (newValue !== originalValue) {
        try {
          let updates = { [field]: newValue, lastEditedBy: currentUser ? currentUser.u : 'system' };
          if (field === 'otel') updates.santiye = newValue; // sync santiye
          
          await col('items').doc(id).update(updates);
          const idx = items.findIndex(x => x.id === id);
          if (idx >= 0) items[idx] = { ...items[idx], ...updates };
          
          showToast('Bilgi başarıyla güncellendi.');
        } catch(err) {
          showToast('Güncelleme hatası: ' + err.message, 'error');
        }
      }
    }
    render();
    updateStats();
  };
  
  input.onblur = () => finishEdit(true);
  input.onkeydown = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      finishEdit(true);
    } else if (evt.key === 'Escape') {
      evt.preventDefault();
      finishEdit(false);
    }
  };
});

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('load',()=>{
  initTheme();
  initEnergyMode();
  
  // Attach premium 3D Tilt mouse effect to Login Card and background mesh glow
  const loginScr = document.getElementById('loginScreen');
  const loginCard = document.querySelector('.login-card');
  
  if (loginScr) {
    loginScr.addEventListener('mousemove', (e) => {
      const rect = loginScr.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      loginScr.style.setProperty('--login-mouse-x', `${x}%`);
      loginScr.style.setProperty('--login-mouse-y', `${y}%`);
    });
  }
  
  if (loginCard) {
    loginCard.addEventListener('mousemove', (e) => {
      const rect = loginCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const rotateX = ((yc - y) / yc) * 10;
      const rotateY = ((x - xc) / xc) * 10;
      loginCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      loginCard.style.boxShadow = '0 25px 50px rgba(99, 102, 241, 0.15), 0 0 30px rgba(99, 102, 241, 0.1)';
    });
    loginCard.addEventListener('mouseleave', () => {
      loginCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      loginCard.style.boxShadow = '';
    });
  }

  setTimeout(async ()=>{
    // Auto-login session check on page refresh
    const savedSession = localStorage.getItem('ysr_session');
    let autoLoginSuccess = false;
    
    if (savedSession && db) {
      try {
        const session = JSON.parse(savedSession);
        await loadAll();
        const found = users.find(x => x.u === session.u && x.p === session.p);
        if (found) {
          currentUser = found;
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('appScreen').style.display = 'flex';
          document.getElementById('appScreen').style.opacity = '1';
          document.getElementById('appScreen').style.transform = 'scale(1)';
          document.getElementById('appScreen').style.filter = 'blur(0)';
          document.getElementById('topbarUser').textContent = currentUser.u + (currentUser.r === 'admin' ? ' · Admin' : '');
          buildTabs(); populateMahalFilter(); render(); updateSortHeadersUI(); updateStats(); checkOverdue(); loadProfile();
          autoLoginSuccess = true;
        }
      } catch (err) {
        console.error("Auto login error:", err);
      }
    }
    
    // Hide loading overlay AFTER we have decided which screen to show
    document.getElementById('loadingOverlay').style.display = 'none';
    
    if (!autoLoginSuccess) {
      document.getElementById('loginScreen').style.display = 'flex';
    }
  },800);
});