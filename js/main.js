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

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
}

function initTheme() {
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
  }
  setTheme(savedTheme);
  
  // Listen for changes in OS theme settings if user hasn't set custom theme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// ── Extreme Visual Feast & Energy Mode Engine ──────────────────
let energyMode = 'enabled'; // 'enabled' (Optimization ON) or 'disabled' (Extreme ON)
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
    initAuroraEffect();
    bindExtremeEvents();
  } else {
    document.body.classList.remove('extreme-active');
    if (btn) {
      btn.classList.add('eco-mode-btn');
      btn.classList.remove('extreme-mode-btn');
      btn.title = 'Optimizasyon Modu (Açmak için tıklayın)';
    }
    stopAuroraEffect();
    unbindExtremeEvents();
  }
}

function toggleEnergyMode() {
  if (energyMode === 'enabled') {
    energyMode = 'disabled';
    showToast('Optimizasyon Modu Kapalı!', 'info');
  } else {
    energyMode = 'enabled';
    showToast('Optimizasyon Modu Devrede (Enerji Tasarrufu).', 'success');
  }
  localStorage.setItem('energyMode', energyMode);
  initEnergyMode();
}

// Ambient Aurora Glassmorphism Engine
let auroraAnimationId = null;
let currentAuroraX = window.innerWidth / 2;
let currentAuroraY = window.innerHeight / 2;

function initAuroraEffect() {
  let container = document.getElementById('auroraContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'auroraContainer';
    container.className = 'aurora-container';
    
    const orb1 = document.createElement('div');
    orb1.className = 'aurora-orb orb-1';
    
    const orb2 = document.createElement('div');
    orb2.className = 'aurora-orb orb-2';
    
    container.appendChild(orb1);
    container.appendChild(orb2);
    // Put it at the very bottom
    document.body.prepend(container);
  }
  container.style.display = 'block';
  
  if (auroraAnimationId) cancelAnimationFrame(auroraAnimationId);
  auroraLoop();
}

function stopAuroraEffect() {
  const container = document.getElementById('auroraContainer');
  if (container) {
    container.style.display = 'none';
  }
  if (auroraAnimationId) {
    cancelAnimationFrame(auroraAnimationId);
    auroraAnimationId = null;
  }
}

function auroraLoop() {
  if (mouse.x !== null && mouse.y !== null) {
    currentAuroraX += (mouse.x - currentAuroraX) * 0.04;
    currentAuroraY += (mouse.y - currentAuroraY) * 0.04;
  }
  
  const container = document.getElementById('auroraContainer');
  if (container) {
    container.style.setProperty('--aurora-x', `${currentAuroraX}px`);
    container.style.setProperty('--aurora-y', `${currentAuroraY}px`);
  }
  
  auroraAnimationId = requestAnimationFrame(auroraLoop);
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

let activeTiltCard = null;

function documentTiltMove(e) {
  if (energyMode === 'enabled') return;
  const card = e.target.closest('.stat-card, .chart-card, .panel-card');
  
  if (!card) {
    if (activeTiltCard) {
      activeTiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      activeTiltCard.style.boxShadow = '';
      activeTiltCard = null;
    }
    return;
  }
  
  activeTiltCard = card;
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

function bindExtremeEvents() {
  window.addEventListener('mousemove', extremeMouseMove);
  window.addEventListener('mouseleave', extremeMouseLeave);
  document.addEventListener('mousemove', documentTiltMove);
}

function unbindExtremeEvents() {
  window.removeEventListener('mousemove', extremeMouseMove);
  window.removeEventListener('mouseleave', extremeMouseLeave);
  document.removeEventListener('mousemove', documentTiltMove);
  
  if (activeTiltCard) {
    activeTiltCard.style.transform = '';
    activeTiltCard.style.boxShadow = '';
    activeTiltCard = null;
  }
}

// ── Event listeners ───────────────────────────────────────────
function safeListen(id, eventName, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener(eventName, handler);
  }
}

safeListen('modalBg', 'click', function(e){if(e.target===this)closeModal();});
safeListen('kesifModalBg', 'click', function(e){if(e.target===this)closeKesifModal();});
safeListen('userEditModalBg', 'click', function(e){if(e.target===this)closeUserEditModal();});
safeListen('approveModalBg', 'click', function(e){if(e.target===this)closeApproveModal();});
safeListen('hakedisModalBg', 'click', function(e){if(e.target===this)closeHakedisModal();});
safeListen('invoiceModalBg', 'click', function(e){if(e.target===this)closeInvoiceModal();});
safeListen('li_p', 'keydown', e=>{if(e.key==='Enter')doLogin();});
safeListen('li_u', 'keydown', e=>{if(e.key==='Enter') { const p = document.getElementById('li_p'); if(p) p.focus(); }});

safeListen('f_bas', 'change', function() {
  const bit = document.getElementById('f_bit');
  if (bit) bit.min = this.value;
});
safeListen('f_bit', 'change', function() {
  const bas = document.getElementById('f_bas');
  if (bas) bas.max = this.value;
});

// Double click to inline edit in table
safeListen('tbody', 'dblclick', function(e) {
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
        
        // Fetch only the specific user document to prevent loading entire collection
        const userQuery = await col('users').where('u', '==', session.u).get();
        let found = null;
        userQuery.forEach(doc => {
          found = { id: doc.id, ...doc.data() };
        });
        
        let isMatch = false;
        if (found) {
          isMatch = (found.p === session.p) || (await sha256(found.p) === session.p);
        }
        if (found && isMatch) {
          currentUser = found;
          
          // Subscribe to users collection snapshot only if user has admin role
          if (currentUser.r === 'admin') {
            await setupSnapshot('users', null, null, d => { users = d; });
          }
          
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('appScreen').style.display = 'flex';
          document.getElementById('appScreen').style.opacity = '1';
          document.getElementById('appScreen').style.transform = '';
          document.getElementById('appScreen').style.filter = '';
          document.getElementById('topbarUser').textContent = currentUser.u + (currentUser.r === 'admin' ? ' · Admin' : '');
          buildTabs(); populateMahalFilter(); render(); updateSortHeadersUI(); updateStats(); checkOverdue(); loadProfile();
          if (typeof startPresenceHeartbeat === 'function') startPresenceHeartbeat();
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

// Global keyboard shortcuts (ESC key to close modals)
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal-bg.open');
    openModals.forEach(modal => {
      const id = modal.id;
      if (id === 'modalBg') {
        if (typeof closeModal === 'function') closeModal();
      } else if (id === 'kesifModalBg') {
        if (typeof closeKesifModal === 'function') closeKesifModal();
      } else if (id === 'approveModalBg') {
        if (typeof closeApproveModal === 'function') closeApproveModal();
      } else if (id === 'hakedisModalBg') {
        if (typeof closeHakedisModal === 'function') closeHakedisModal();
      } else if (id === 'invoiceModalBg') {
        if (typeof closeInvoiceModal === 'function') closeInvoiceModal();
      } else if (id === 'userEditModalBg') {
        if (typeof closeUserEditModal === 'function') closeUserEditModal();
      } else {
        modal.classList.remove('open');
      }
    });
  }
});

// Online/Offline status event handling
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (navigator.onLine) {
    if (banner) banner.style.display = 'none';
    if (typeof showToast === 'function') {
      showToast('Yeniden çevrimiçi olundu. Veriler senkronize ediliyor.', 'success');
    }
  } else {
    if (banner) banner.style.display = 'flex';
    if (typeof showToast === 'function') {
      showToast('İnternet bağlantısı koptu. Çevrimdışı moda geçildi.', 'error');
    }
  }
}
// Run once on load to set initial state
updateOnlineStatus();