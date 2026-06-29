// ── PREMIUM 2026 UX/UI MICRO-DETAILS ─────────────────────────

window.currentFormState = "";
function getFormState(containerId) {
  const container = document.getElementById(containerId);
  if(!container) return "";
  const inputs = container.querySelectorAll('input, select, textarea');
  const obj = {};
  inputs.forEach(i => { if(i.id) obj[i.id] = i.value; });
  return JSON.stringify(obj);
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const modalBg = document.getElementById('modalBg');
    const kesifModalBg = document.getElementById('kesifModalBg');
    if (modalBg && modalBg.classList.contains('open')) {
      if (typeof saveItem === 'function') saveItem();
    } else if (kesifModalBg && kesifModalBg.classList.contains('open')) {
      if (typeof saveKesif === 'function') saveKesif();
    }
  }
  
  if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const srch = document.getElementById('srch');
    if (srch) srch.focus();
  }
  
  // Ctrl+K to open Command Palette
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (typeof openCmdPalette === 'function') openCmdPalette();
  }
});

// SMART TITLE CASE Removed by User Request


// Global debounced rendering functions
const debouncedRender = debounce(() => { if(typeof render === 'function') render(); }, 300);
const debouncedRenderKesif = debounce(() => { if(typeof renderKesif === 'function') renderKesif(); }, 300);
const debouncedRenderReports = debounce(() => { if(typeof renderReports === 'function') renderReports(); }, 300);
window.debouncedRender = debouncedRender;
window.debouncedRenderKesif = debouncedRenderKesif;
window.debouncedRenderReports = debouncedRenderReports;

// Dynamic Radial-Gradient Card Reflection Glow Tracking (Optimized with requestAnimationFrame)
let isTickingMouse = false;
document.addEventListener('mousemove', e => {
  if (window.energyMode === 'enabled') return;
  if (!isTickingMouse) {
    window.requestAnimationFrame(() => {
      const card = e.target.closest('.stat-card, .chart-card, .panel-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
      isTickingMouse = false;
    });
    isTickingMouse = true;
  }
});

// Dynamic Bitiş Sayaçları Badge Generator
const getDynamicDateBadge = (bas, bit, durum) => {
  if (!bit) return '';
  if (!['Onaylandı', 'İş Yapım Aşamasında'].includes(durum)) return '';
  
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  const bitDate = new Date(bit);
  bitDate.setHours(0,0,0,0);
  
  const diffTime = bitDate - todayDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const clockIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:3px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
  const hourglassIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:3px"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>`;

  if (diffDays < 0) {
    return `<span class="badge b-3" style="padding:2px 8px;font-size:10px;margin-top:4px;display:inline-flex;">${clockIcon}Gecikti</span>`;
  } else if (diffDays === 0) {
    return `<span class="badge b-1" style="padding:2px 8px;font-size:10px;margin-top:4px;display:inline-flex;animation:calmHeartbeat 1.5s infinite;">${hourglassIcon}Son 24 Saat</span>`;
  } else if (diffDays === 1) {
    return `<span class="badge b-1" style="padding:2px 8px;font-size:10px;margin-top:4px;display:inline-flex;">${hourglassIcon}Son 1 Gün</span>`;
  } else if (diffDays <= 7) {
    return `<span class="badge b-1" style="padding:2px 8px;font-size:10px;margin-top:4px;display:inline-flex;">${hourglassIcon}Son ${diffDays} Gün</span>`;
  } else {
    return `<span class="badge b-4" style="padding:2px 8px;font-size:10px;margin-top:4px;display:inline-flex;">${clockIcon}Kalan Gün: ${diffDays}</span>`;
  }
};

// 2D HTML5 Confetti Spark Particle Blast Engine
function triggerConfetti(x, y) {
  if (window.energyMode === 'enabled') return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const colors = ['#4f46e5', '#8b5cf6', '#10b981', '#fbbf24', '#ef4444', '#3b82f6'];
  const particles = [];
  
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      radius: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
      gravity: 0.15
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    
    particles.forEach(p => {
      if (p.alpha > 0) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        alive = true;
      }
    });
    
    if (alive) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  
  animate();
}

// ── UYARI MODALI ──────────────────────────────────────────────
let activeAlertCallback = null;

function showAlertModal(message, onConfirm) {
  document.getElementById('alertModalMessage').textContent = message;
  const bg = document.getElementById('alertModalBg');
  bg.classList.add('active');
  
  activeAlertCallback = onConfirm;
  
  const confirmBtn = document.getElementById('alertBtnConfirm');
  
  // Create a new fresh copy of the button to remove old event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  newConfirmBtn.addEventListener('click', () => {
    closeAlertModal();
    if (activeAlertCallback) {
      activeAlertCallback();
      activeAlertCallback = null;
    }
  });
}

function closeAlertModal() {
  document.getElementById('alertModalBg').classList.remove('active');
  activeAlertCallback = null;
}

// ── Tabs ──────────────────────────────────────────────────────
function buildTabs(){
  let html=`<div class="tab active" id="t_teklifler" role="tab" tabindex="0" aria-selected="true" onclick="showTab('teklifler')">Teklifler</div>`;
  html+=`<div class="tab" id="t_kesifler" role="tab" tabindex="0" aria-selected="false" onclick="showTab('kesifler')">Keşifler</div>`;
  html+=`<div class="tab" id="t_analiz" role="tab" tabindex="0" aria-selected="false" onclick="showTab('analiz')">Analiz</div>`;
  html+=`<div class="tab" id="t_raporlar" role="tab" tabindex="0" aria-selected="false" onclick="showTab('raporlar')">Raporlar</div>`;
  html+=`<div class="tab" id="t_mahal" role="tab" tabindex="0" aria-selected="false" onclick="showTab('mahal')">İşverenler</div>`;
  html+=`<div class="tab" id="t_hesap" role="tab" tabindex="0" aria-selected="false" onclick="showTab('hesap')">Profilim</div>`;
  html+=`<div class="tab" id="t_logs" role="tab" tabindex="0" aria-selected="false" onclick="showTab('logs')">İşlem Geçmişi</div>`;
  if(currentUser.r==='admin')html+=`<div class="tab" id="t_admin" role="tab" tabindex="0" aria-selected="false" onclick="showTab('admin')">Kullanıcılar</div>`;
  
  const tabsContainer = document.getElementById('tabsEl');
  tabsContainer.setAttribute('role', 'tablist');
  tabsContainer.innerHTML=html;

  const tabElements = tabsContainer.querySelectorAll('.tab');
  tabElements.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // Mobil alt menü (Bottom Navigation)
  let mHtml=`<button class="mobile-nav-item active" id="mn_teklifler" onclick="showTab('teklifler')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
    <span>Teklifler</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_kesifler" onclick="showTab('kesifler')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
    <span>Keşifler</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_analiz" onclick="showTab('analiz')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
    <span>Analiz</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_raporlar" onclick="showTab('raporlar')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
    <span>Raporlar</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_mahal" onclick="showTab('mahal')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    <span>İşverenler</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_hesap" onclick="showTab('hesap')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    <span>Profil</span>
  </button>`;
  mHtml+=`<button class="mobile-nav-item" id="mn_logs" onclick="showTab('logs')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    <span>Geçmiş</span>
  </button>`;
  if(currentUser.r==='admin') {
    mHtml+=`<button class="mobile-nav-item" id="mn_admin" onclick="showTab('admin')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      <span>Kullanıcılar</span>
    </button>`;
  }
  const mNav = document.getElementById('mobileNav');
  if(mNav) mNav.innerHTML = mHtml;

  // Desktop scrolled tabs (topbar sticky)
  let stHtml=`<button class="scrolled-tab-item active" id="st_teklifler" onclick="showTab('teklifler')" data-tooltip="Teklifler">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_kesifler" onclick="showTab('kesifler')" data-tooltip="Keşifler">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_analiz" onclick="showTab('analiz')" data-tooltip="Analiz">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_raporlar" onclick="showTab('raporlar')" data-tooltip="Raporlar">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_mahal" onclick="showTab('mahal')" data-tooltip="İşverenler">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_hesap" onclick="showTab('hesap')" data-tooltip="Profil">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_logs" onclick="showTab('logs')" data-tooltip="Geçmiş">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  </button>`;
  if(currentUser.r==='admin') {
    stHtml+=`<button class="scrolled-tab-item" id="st_admin" onclick="showTab('admin')" data-tooltip="Kullanıcılar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    </button>`;
  }
  const sTabs = document.getElementById('scrolledTabs');
  if(sTabs) sTabs.innerHTML = stHtml;
}
function showTab(t){
  if (t === 'admin' && (!currentUser || currentUser.r !== 'admin')) {
    showToast('Bu sayfaya erişim yetkiniz bulunmamaktadır.', 'error');
    showTab('teklifler');
    return;
  }

  document.querySelectorAll('.tab').forEach(b=>{
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const el=document.getElementById('t_'+t);
  if(el) {
    el.classList.add('active');
    el.setAttribute('aria-selected', 'true');
  }
  
  // Mobil alt menü elemanlarını da aktif yap
  document.querySelectorAll('.mobile-nav-item').forEach(b=>{
    b.classList.remove('active');
  });
  const mEl=document.getElementById('mn_'+t);
  if(mEl) mEl.classList.add('active');
  
  // Scrolled-tab elemanlarını aktif yap
  document.querySelectorAll('.scrolled-tab-item').forEach(b=>{
    b.classList.remove('active');
  });
  const stEl=document.getElementById('st_'+t);
  if(stEl) stEl.classList.add('active');
  
  // Mobil FAB görünürlüğü (sadece teklifler sayfasında göster)
  const mFab=document.getElementById('mobileFab');
  if(mFab){
    if (t === 'teklifler') {
      mFab.classList.add('show');
    } else {
      mFab.classList.remove('show');
    }
  }

  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page_'+(t==='admin'?'admin':t)).classList.add('active');
  
  if(t === 'logs' && typeof renderLogs === 'function') {
    renderLogs();
  }
  
  if(t==='analiz') {
    renderCharts();
  }
  if(t==='raporlar')renderReports();
  if(t==='mahal')renderMahalPanel();
  if(t==='kesifler')renderKesif();
  if(t==='admin')renderAdminPanel();
}

// ── Mahaller ──────────────────────────────────────────────────
function populateMahalFilter(){
  const sel=document.getElementById('fMahal'),cur=sel.value;
  const sortedMahals = [...mahals].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const optionsHtml = sortedMahals.map(m=>`<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  sel.innerHTML='<option value="">Tüm işverenler</option>'+optionsHtml;
  if(cur)sel.value=cur;
}
function populateModalMahal(val){
  const sel=document.getElementById('f_mahal');
  let matchedId = val;
  if (val) {
    const m = mahals.find(x => x.id === val || (x.name && x.name.toLowerCase() === val.toLowerCase()));
    if (m) matchedId = m.id;
  }
  let sortedMahals = [...mahals].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  if (matchedId) {
    const selectedIdx = sortedMahals.findIndex(m => m.id === matchedId);
    if (selectedIdx > -1) {
      const [selectedMahal] = sortedMahals.splice(selectedIdx, 1);
      sortedMahals.unshift(selectedMahal);
    }
  }
  sel.innerHTML='<option value="">— işveren seçin —</option>'+sortedMahals.map(m=>`<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  if(matchedId)sel.value=matchedId;
}

function filterByMahal(mahalId) {
  document.getElementById('fMahal').value = mahalId;
  showTab('teklifler');
  render();
}

function renderMahalPanel(){
  const tb=document.getElementById('mahalTbody');
  const mobList=document.getElementById('mobileMahalWrap');
  if(!mahals.length){
    if(tb) tb.innerHTML='<tr><td colspan="3" style="padding:16px;color:var(--text2)">Henüz işveren eklenmedi.</td></tr>';
    if(mobList) mobList.innerHTML='<div style="padding:16px;color:var(--text2);text-align:center;">Henüz işveren eklenmedi.</div>';
    return;
  }
  const sorted = [...mahals].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  if(tb) {
    tb.innerHTML=sorted.map(m=>`<tr>
      <td><span class="mahal-tag" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;" onclick="filterByMahal('${m.id}')" title="Bu işverene ait teklifleri listele/filtrele"><span>${escapeHTML(m.name)}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span></td>
      <td style="color:var(--text2); cursor:pointer;" onclick="filterByMahal('${m.id}')">${items.filter(x=>x.mahalId===m.id).length} teklif</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn-edit" onclick="editMahal('${m.id}','${escapeHTML(escapeJS(m.name))}')" aria-label="${escapeHTML(m.name)} işverenini düzenle">Düzenle</button>
          <button class="btn-del" onclick="delMahal('${m.id}','${escapeHTML(escapeJS(m.name))}')" aria-label="${escapeHTML(m.name)} işverenini sil">Sil</button>
        </div>
      </td>
    </tr>`).join('');
  }
  if(mobList){
    mobList.innerHTML=sorted.map(m=>`<div class="mobile-card" style="padding: 14px; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="mahal-tag" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700;" onclick="filterByMahal('${m.id}')">
          <span>${escapeHTML(m.name)}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <span style="font-size:12px; color:var(--text2); font-weight:600; cursor:pointer;" onclick="filterByMahal('${m.id}')">${items.filter(x=>x.mahalId===m.id).length} teklif</span>
      </div>
      <div style="display:flex; gap:8px; margin-top: 4px;">
        <button class="btn-edit" style="padding:6px 10px; flex:1; font-size:12px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="editMahal('${m.id}','${escapeHTML(escapeJS(m.name))}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Düzenle</button>
        <button class="btn-del" style="padding:6px 10px; flex:1; font-size:12px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="delMahal('${m.id}','${escapeHTML(escapeJS(m.name))}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Sil</button>
      </div>
    </div>`).join('');
  }
}
async function editMahal(id, currentName) {
  const newName = await showPrompt("İşveren Adını Düzenle", currentName);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) {
    showToast("İşveren adı boş olamaz!", "error");
    return;
  }
  if (mahals.find(m => m.id !== id && m.name.toLowerCase() === trimmed.toLowerCase())) {
    showToast("Bu isimde bir işveren zaten mevcut!", "error");
    return;
  }
  try {
    await col('mahals').doc(id).update({ name: trimmed });
    showToast("İşveren adı güncellendi.");
  } catch (e) {
    showToast("İşveren güncellenirken hata: " + e.message, "error");
  }
}
async function addMahal(){
  const v=document.getElementById('new_mahal').value.trim();
  const err=document.getElementById('mahalErr');
  if(!v){err.textContent='İşveren adı boş olamaz';return;}
  if(mahals.find(m=>m.name===v)){err.textContent='Bu işveren zaten var';return;}
  try{
    await col('mahals').add({name:v});
    document.getElementById('new_mahal').value='';err.textContent='';
  }catch(e){err.textContent='İşveren eklenirken hata: ' + e.message;}
}
async function delMahal(id,name){
  const cnt=items.filter(x=>x.mahalId===id).length;
  if(cnt>0){
    const ok = await showConfirm('İşvereni Sil', `"${name}" işvereninde ${cnt} teklif var. Yine de silinsin mi?`, true);
    if(!ok)return;
  } else {
    const ok = await showConfirm('İşvereni Sil', `"${name}" işverenini silmek istediğinize emin misiniz?`, true);
    if(!ok)return;
  }
  try{
    await col('mahals').doc(id).delete();
    showToast('İşveren başarıyla silindi.');
  }catch(e){showToast('İşveren silinirken hata: ' + e.message, 'error');}
}

// ── Kullanıcılar ──────────────────────────────────────────────
async function renderAdminPanel(){
  try {
    const tb=document.getElementById('userTbody');
    const mobList=document.getElementById('mobileUserWrap');
    if(!tb && !mobList) return;

    const itemsHtml = users.map(u=>{
      let name = u.name || "—";
      let job = u.job || "—";
      if (name === "—" || job === "—") {
        const raw = localStorage.getItem('profile_' + u.u);
        if (raw) {
          const profile = JSON.parse(raw);
          if (name === "—") name = profile.name || "—";
          if (job === "—") job = profile.job || "—";
        } else if (u.u === 'admin') {
          if (name === "—") name = "YSR Admin";
          if (job === "—") job = "Genel Yönetici";
        } else if (u.u === 'ysr') {
          if (name === "—") name = "YSR Kullanıcı";
          if (job === "—") job = "İnşaat Mühendisi";
        }
      }
      return { u, name, job };
    });

    if(tb) {
      tb.innerHTML=itemsHtml.map(item=>{
        let isOnline = false;
        if (item.u.status === 'online') {
          if (item.u.lastActive) {
            const lastActiveDate = item.u.lastActive.toDate ? item.u.lastActive.toDate() : new Date(item.u.lastActive);
            const diffMins = (new Date() - lastActiveDate) / 60000;
            if (diffMins < 5) isOnline = true;
          } else {
            isOnline = true;
          }
        }
        
        const statusHtml = isOnline 
          ? `<span style="display:inline-flex; align-items:center; gap:6px; color:#10b981; font-weight:600;"><span class="user-status-dot online"></span> Çevrim içi</span>`
          : `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--text3); font-weight:500;"><span class="user-status-dot offline"></span> Çevrim dışı</span>`;

        return `<tr>
          <td>${item.u.u}</td>
          <td>${item.u.r==='admin'?'Admin':'Kullanıcı'}</td>
          <td style="font-weight:700;">${item.name}</td>
          <td style="color:var(--text2); font-weight:600;">${item.job}</td>
          <td>${statusHtml}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-edit" onclick="openUserEditModal('${item.u.id}')" aria-label="${item.u.u} kullanıcısını düzenle">Düzenle</button>
              ${item.u.u!=='admin'?`<button class="btn-del" onclick="delUser('${item.u.id}','${item.u.u}')" aria-label="${item.u.u} kullanıcısını sil">Sil</button>`:'—'}
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    if(mobList) {
      mobList.innerHTML=itemsHtml.map(item=>{
        let isOnline = false;
        if (item.u.status === 'online') {
          if (item.u.lastActive) {
            const lastActiveDate = item.u.lastActive.toDate ? item.u.lastActive.toDate() : new Date(item.u.lastActive);
            const diffMins = (new Date() - lastActiveDate) / 60000;
            if (diffMins < 5) isOnline = true;
          } else {
            isOnline = true;
          }
        }

        return `<div class="mobile-card" style="padding:14px; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px;">
              ${item.name}
              <span class="user-status-dot ${isOnline ? 'online' : 'offline'}" style="margin:0; width:6px; height:6px;"></span>
            </span>
            <span class="badge ${item.u.r==='admin'?'b-2':'b-0'}" style="font-size:10px; padding:2px 8px;">${item.u.r==='admin'?'Admin':'Kullanıcı'}</span>
          </div>
          <div style="font-size:12px; color:var(--text2); font-weight:600;">
            Kullanıcı Adı: <span style="color:var(--text);">${item.u.u}</span> | Meslek: <span style="color:var(--text);">${item.job}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:4px;">
            <button class="btn-edit" style="padding:6px 10px; flex:1; font-size:12px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openUserEditModal('${item.u.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Düzenle</button>
            ${item.u.u!=='admin'?`<button class="btn-del" style="padding:6px 10px; flex:1; font-size:12px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="delUser('${item.u.id}','${item.u.u}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Sil</button>`:''}
          </div>
        </div>`;
      }).join('');
    }
  } catch(e) {
    console.error("renderAdminPanel error:", e);
    showToast("Kullanıcılar yüklenirken hata oluştu.", "error");
  }
}

function openUserEditModal(id){
  editUserId = id;
  const it = users.find(x => x.id === id);
  if (!it) return;
  
  let name = it.name || "";
  let job = it.job || "İnşaat Mühendisi / Mimar";
  if (!name || name === "") {
    const raw = localStorage.getItem('profile_' + it.u);
    if (raw) {
      const p = JSON.parse(raw);
      name = p.name || "";
      job = p.job || "İnşaat Mühendisi / Mimar";
    }
  }
  
  document.getElementById('fe_username').value = it.u;
  document.getElementById('fe_role').value = it.r || "user";
  document.getElementById('fe_name').value = name;
  document.getElementById('fe_job').value = job;
  document.getElementById('fe_pass').value = "";
  
  document.getElementById('userEditModalBg').classList.add('open');
  document.getElementById('fe_role').focus();
}

function closeUserEditModal(){
  document.getElementById('userEditModalBg').classList.remove('open');
  editUserId = null;
}

async function saveUserEdit(){
  const btn = document.getElementById('saveUserEditBtn');
  btn.disabled = true;
  btn.textContent = "Kaydediliyor...";
  
  try {
    const it = users.find(x => x.id === editUserId);
    if (!it) return;
    
    const role = document.getElementById('fe_role').value;
    const name = document.getElementById('fe_name').value.trim();
    const job = document.getElementById('fe_job').value;
    const pass = document.getElementById('fe_pass').value;
    
    const updates = {
      r: role,
      name,
      job
    };
    
    if (pass) {
      if (pass.length < 3) {
        showToast("Şifre en az 3 karakter olmalıdır!", "error");
        btn.disabled = false;
        btn.textContent = "Kaydet";
        return;
      }
      updates.p = await sha256(pass);
    }
    
    await col('users').doc(editUserId).update(updates);
    
    // Update local users array to prevent redundant fetches
    Object.assign(it, updates);
    if (it.u === currentUser.u) {
      Object.assign(currentUser, updates);
      if (updates.name || updates.job) {
        document.getElementById('profNameTitle').textContent = currentUser.name || currentUser.u;
        document.getElementById('profRoleTitle').textContent = currentUser.job || currentUser.r;
      }
    }
    
    showToast("Kullanıcı başarıyla güncellendi.");
    closeUserEditModal();
    renderAdminPanel();
  } catch (e) {
    showToast("Güncellenirken hata oluştu: " + e.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Kaydet";
  }
}
async function addUser(){
  const un=document.getElementById('nu').value.trim(),up=document.getElementById('np').value,ur=document.getElementById('nr').value;
  const err=document.getElementById('uErr');
  if(!un||!up){err.textContent='Ad ve şifre gerekli';return;}
  try{
    const existing=users.find(d=>d.u===un);
    if(existing){err.textContent='Bu kullanıcı zaten var';return;}
    
    const securePassword = await sha256(up);
    const docRef = await col('users').add({u:un,p:securePassword,r:ur});
    users.push({id: docRef.id, u:un, p:securePassword, r:ur});
    err.textContent='';document.getElementById('nu').value='';document.getElementById('np').value='';
    renderAdminPanel();
  }catch(e){err.textContent='Kullanıcı eklenirken hata: ' + e.message;}
}
async function delUser(id,un){
  const ok = await showConfirm('Kullanıcıyı Sil', `${un} kullanıcısını silmek istediğinize emin misiniz?`, true);
  if(!ok)return;
  try{
    await col('users').doc(id).delete();
    users = users.filter(x => x.id !== id);
    showToast('Kullanıcı başarıyla silindi.');
    renderAdminPanel();
  }catch(e){showToast('Kullanıcı silinirken hata: ' + e.message, 'error');}
}
async function changePass(){
  const old=document.getElementById('cp_old').value,nw=document.getElementById('cp_new').value,nw2=document.getElementById('cp_new2').value;
  const err=document.getElementById('cpErr'),ok=document.getElementById('cpOk');
  err.textContent='';ok.textContent='';
  
  const hashedOld = await sha256(old);
  if(currentUser.p !== old && currentUser.p !== hashedOld){err.textContent='Mevcut şifre yanlış';return;}
  if(!nw||nw.length<3){err.textContent='Yeni şifre en az 3 karakter olmalı';return;}
  if(nw!==nw2){err.textContent='Şifreler eşleşmiyor';return;}
  try{
    const secureNewPassword = await sha256(nw);
    await col('users').doc(currentUser.id).update({p:secureNewPassword});
    currentUser.p=secureNewPassword;
    ok.textContent='Şifre başarıyla güncellendi!';
    document.getElementById('cp_old').value='';document.getElementById('cp_new').value='';document.getElementById('cp_new2').value='';
  }catch(e){err.textContent='Şifre güncellenirken hata: ' + e.message;}
}

function handleSort(key) {
  if (sortKey === key) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = (key === 'ttut' || key === 'otut') ? 'desc' : 'asc';
  }
  render();
  updateSortHeadersUI();
}

function updateSortHeadersUI() {
  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
    const icon = th.querySelector('.sort-icon');
    if (icon) icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></svg>';
  });
  
  const activeTh = document.getElementById('h_' + sortKey);
  if (activeTh) {
    activeTh.classList.add(sortDir);
    const icon = activeTh.querySelector('.sort-icon');
    if (icon) icon.innerHTML = sortDir === 'asc' 
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>' 
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  }
}

// ── İlerleme Göstergesi (Stepper) ─────────────────────────────
function getStepperHtml(durum) {
  const states = ['Gönderilecek', 'Gönderildi', 'Onaylandı', 'İş Yapım Aşamasında', 'Tamamlandı', 'Hakediş Onaylandı', 'Faturalandı'];
  let idx = states.indexOf(durum);
  if (durum === 'Reddedildi' || durum === 'İptal') {
    return `<div style="display:flex; gap:4px; margin-top:4px; justify-content:center;"><span style="width:6px; height:6px; border-radius:50%; background:var(--red);"></span></div>`;
  }
  if (idx === -1) return '';
  
  let stepIdx = 0;
  if (idx <= 1) stepIdx = 0; 
  else if (idx === 2) stepIdx = 1; 
  else if (idx === 3) stepIdx = 2; 
  else if (idx === 4) stepIdx = 3; 
  else if (idx >= 5) stepIdx = 4; 
  
  let html = `<div class="stepper-dots" style="display:flex; gap:4px; margin-top:4px; justify-content:center;" title="${durum}">`;
  for(let i=0; i<5; i++) {
    const isPast = i < stepIdx;
    const isCurrent = i === stepIdx;
    if (isPast) {
      html += `<span style="width:6px; height:6px; border-radius:50%; background:var(--green); opacity:0.8;"></span>`;
    } else if (isCurrent) {
      html += `<span style="width:6px; height:6px; border-radius:50%; background:var(--primary); box-shadow: 0 0 0 2px var(--bg), 0 0 0 3px var(--primary);"></span>`;
    } else {
      html += `<span style="width:6px; height:6px; border-radius:50%; border:1px solid var(--border); box-sizing:border-box;"></span>`;
    }
  }
  html += `</div>`;
  return html;
}

// ── Render ────────────────────────────────────────────────────
function getMahalName(id){const m=mahals.find(x=>x.id===id);return m?m.name:id||'-';}

const userDisplayNameCache = {};
function getUserDisplayName(u) {
  if (!u || u === 'system') return 'Sistem';
  if (userDisplayNameCache[u]) return userDisplayNameCache[u];
  const userObj = users.find(x => x.u === u);
  if (userObj && userObj.name) {
    userDisplayNameCache[u] = userObj.name;
    return userObj.name;
  }
  try {
    const raw = localStorage.getItem('profile_' + u);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.name) {
        userDisplayNameCache[u] = p.name;
        return p.name;
      }
    }
  } catch(e) {}
  userDisplayNameCache[u] = u;
  return u;
}

function render(){
  const q=(document.getElementById('srch').value||'').toLowerCase();
  const cat=document.getElementById('fCat').value;
  const stat=document.getElementById('fStat').value;
  const mah=document.getElementById('fMahal').value;
  


  const f=items.filter(it=>{
    const nameVal = it.santiye || it.otel || '';
    if(q&&!nameVal.toLowerCase().includes(q)&&!getMahalName(it.mahalId).toLowerCase().includes(q))return false;
    if(cat&&it.kat!==cat)return false;
    if(stat&&it.durum!==stat)return false;
    if(mah&&it.mahalId!==mah)return false;
    return true;
  });

  // Sütun sıralama işlemi
  f.sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    
    if (sortKey === 'ttut' || sortKey === 'otut') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else if (sortKey === 'ttar' || sortKey === 'otar' || sortKey === 'bas' || sortKey === 'bit') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }
    
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const getProgressData = (durum) => {
    switch(durum) {
      case 'Gönderilecek': return { pct: 10, color: 'var(--text3)' };
      case 'Gönderildi': return { pct: 25, color: 'var(--primary)' };
      case 'Onaylandı': return { pct: 50, color: 'var(--green)' };
      case 'İş Yapım Aşamasında': return { pct: 75, color: 'var(--purple)' };
      case 'Tamamlandı': return { pct: 85, color: 'var(--purple)' };
      case 'Hakediş Onaylandı': return { pct: 95, color: 'var(--green)' };
      case 'Faturalandı': return { pct: 100, color: 'var(--green)' };
      case 'Reddedildi':
      case 'İptal': return { pct: 100, color: 'var(--red)' };
      default: return { pct: 0, color: 'transparent' };
    }
  };

  const tb=document.getElementById('tbody');
  const mobList = document.getElementById('mobileListWrap');
  
  if(!f.length){
    const emptyStateHtml = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding: 40px 20px; text-align: center;">
        <svg class="empty-state-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Teklif Bulunmamaktadır</div>
          <div style="font-size: 12px; color: var(--text2);">Aradığınız kriterlere uygun teklif bulunamadı.</div>
        </div>
      </div>`;
      
    tb.innerHTML=`<tr class="empty-row">
      <td colspan="7" style="padding: 60px 20px; text-align: center; background:transparent;">
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;">
          <svg class="empty-state-svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Teklif Bulunmamaktadır</div>
            <div style="font-size: 13px; color: var(--text2);">Aradığınız kriterlere uygun teklif bulunamadı veya henüz teklif eklenmedi.</div>
          </div>
        </div>
      </td>
    </tr>`;
    
    if (mobList) mobList.innerHTML = emptyStateHtml;
    return;
  }
  
  const kanbanWrap = document.getElementById('kanbanWrap');
  const tableWrap = document.getElementById('tableWrap');
  
  if (window.kanbanMode) {
    if (tableWrap) tableWrap.style.display = 'none';
    if (mobList) mobList.style.display = 'none';
    if (kanbanWrap) {
      kanbanWrap.style.display = 'flex';
      let html = '';
      STAT_NAMES.forEach(stat => {
        const colItems = f.filter(it => it.durum === stat);
        html += `<div class="kanban-col" data-status="${stat}" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="dragLeave(event)">
          <div class="kanban-col-header">
            <span>${stat}</span>
            <span class="kanban-col-count">${colItems.length}</span>
          </div>
          <div class="kanban-cards">
            ${colItems.map(it => `
              <div class="kanban-card" id="kanban-card-${it.id}" draggable="true" ondragstart="drag(event)" ondragend="dragEnd(event)" onclick="openModal('${it.id}')">
                <div class="kanban-card-title">${escapeHTML(it.santiye || it.otel || '-')}</div>
                <div class="kanban-card-info" style="color:var(--primary); font-weight:700;">${fmtN(it.ttut, it.cur)}</div>
                <div class="kanban-card-info">${escapeHTML(getMahalName(it.mahalId))}</div>
                <div class="kanban-card-footer">
                  <span style="font-weight:600; color:var(--text3);">${getRelativeTime(it.bas)}</span>
                  <span class="mahal-tag">${escapeHTML(it.kat || '-')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
      });
      kanbanWrap.innerHTML = html;
    }
    return;
  } else {
    if (tableWrap) tableWrap.style.display = 'block';
    if (mobList) mobList.style.display = '';
    if (kanbanWrap) kanbanWrap.style.display = 'none';
  }

  tb.innerHTML=f.map((it,i)=>{
    const od=isOD(it);
    const si=STAT_NAMES.indexOf(it.durum);
    
    // Minimalist SVG Icons
    const sendIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    const approveIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const startIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const completeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;
    const editIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const delIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const pdfIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    const invoiceIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;

    const displayName = it.santiye || it.otel || '-';
    const escapedDisplayName = escapeHTML(displayName);
    const fileAttachmentLink = it.fileUrl ? `<a href="${it.fileUrl}" target="_blank" title="Ekli Belge: ${escapeHTML(it.fileName || 'Belgeyi İndir')}" style="text-decoration:none; margin-left:6px; font-size:14px; display:inline-flex; align-items:center; justify-content:center;" onclick="event.stopPropagation();"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></a>` : '';

    const prog = getProgressData(it.durum);
    return`<tr class="${od?'overdue':''}" onclick="toggleDesktopAccordion(event, '${it.id}')" style="cursor:pointer;">
      <td style="color:var(--text2);font-weight:600;text-align:center;background:var(--primary-color-faded);border-radius:4px;" title="Detayları Göster">${i+1}</td>
      <td class="editable-cell" data-id="${it.id}" data-field="otel" title="Çift tıklayıp şantiye adını düzenleyin">
        <div class="cell-text" style="font-weight:700;max-width:180px;white-space:normal;line-height:1.3;margin-bottom:6px">${escapedDisplayName}${fileAttachmentLink}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="mahal-tag" style="padding:2px 8px;font-size:10px">${escapeHTML(getMahalName(it.mahalId))}</span>
          <span class="badge ${CAT_CLS[it.kat]||'b-diger'}" style="padding:2px 8px;font-size:10px">${escapeHTML(it.kat||'-')}</span>
        </div>
      </td>
      <td>
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;">
          <span class="badge ${STAT_CLS[si]||'b-0'}">${it.durum||'-'}</span>
          ${getStepperHtml(it.durum)}
        </div>
      </td>
      <td class="editable-cell" data-id="${it.id}" data-field="ttut" title="Çift tıklayıp teklif tutarını düzenleyin">
        <div style="font-size:13px;color:var(--text2);margin-bottom:4px">${fmt(it.ttar)}</div>
        <div class="cell-text" style="font-weight:700; white-space:nowrap;">${fmtN(it.ttut,it.cur)}</div>
      </td>
      <td class="editable-cell" data-id="${it.id}" data-field="otut" title="Çift tıklayıp onay tutarını düzenleyin">
        <div style="font-size:13px;color:var(--text2);margin-bottom:4px">${it.durum === 'Faturalandı' ? 'Fat: ' + (escapeHTML(it.fno) || fmt(it.ftar)) : fmt(it.otar)}</div>
        <div class="cell-text" style="font-weight:700; white-space:nowrap;">${it.durum === 'Faturalandı' ? fmtN(it.ftut || it.otut, it.cur) : fmtN(it.otut,it.cur)}</div>
      </td>
      <td>
        <div style="font-size:12px;margin-bottom:4px"><span style="color:var(--text2)">Baş:</span> ${fmt(it.bas)} <span style="color:var(--text3); font-size:10px">${getRelativeTime(it.bas)}</span></div>
        <div style="font-size:12px;margin-bottom:4px"><span style="color:var(--text2)">Bit:</span> ${fmt(it.bit)} <span style="color:var(--text3); font-size:10px">${getRelativeTime(it.bit)}</span>${od?'<span class="warn-icon" title="Gecikti" style="display:inline-flex; margin-left:4px; color:var(--red)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>':''}</div>
        <div style="margin-bottom:4px;">${getDynamicDateBadge(it.bas, it.bit, it.durum)}</div>
        ${it.htut ? `<div style="font-size:12px;margin-bottom:4px;color:var(--purple);font-weight:700;white-space:nowrap;"><span style="color:var(--text2)">Hak:</span> ${fmtN(it.htut, it.cur)}</div>` : ''}
        <div style="font-size:12px"><span style="color:var(--text2)">Fat:</span> ${fmt(it.ftar)}</div>
      </td>
      <td style="vertical-align:middle;">
        <span class="mahal-tag" style="background:var(--primary-color-faded); color:var(--text2); border:1px solid var(--border); padding:4px 10px; font-size:11px; font-weight:700;">${getUserDisplayName(it.lastEditedBy || 'system')}</span>
      </td>
      <td style="vertical-align:middle;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;justify-content:flex-start;">
          ${it.durum === 'Gönderilecek' ? `<button class="btn-quick" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'Gönderildi')" title="Gönder">${sendIcon} Gönder</button>` : ''}
          ${it.durum === 'Gönderildi' ? `<button class="btn-quick" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="quickApprove(event, '${it.id}')" title="Onayla">${approveIcon} Onayla</button>` : ''}
          ${it.durum === 'Onaylandı' ? `<button class="btn-quick" style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'İş Yapım Aşamasında')" title="İşe Başla">${startIcon} Başla</button>` : ''}
          ${it.durum === 'İş Yapım Aşamasında' ? `<button class="btn-quick" style="background:var(--purple);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'Tamamlandı')" title="İşi Tamamla">${completeIcon} Tamamla</button>` : ''}
          ${it.durum === 'Tamamlandı' ? `<button class="btn-quick" style="background:var(--purple);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="openHakedisModal(event, '${it.id}')" title="Hakediş Gir">${invoiceIcon} Hakediş Gir</button>` : ''}
          ${it.durum === 'Hakediş Onaylandı' ? `<button class="btn-quick" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="openInvoiceModal(event, '${it.id}')" title="Fatura Ekle">${invoiceIcon} Fatura Ekle</button>` : ''}
          
          <button class="btn-quick" style="background:#475569;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px" onclick="generatePDF('${it.id}')" title="PDF İndir">${pdfIcon}</button>
          <button class="btn-edit" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;" onclick="openModal('${it.id}')" aria-label="${escapedDisplayName} düzenle">${editIcon}</button>
          <button class="btn-del" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;" onclick="delItem('${it.id}')" aria-label="${escapedDisplayName} sil">${delIcon}</button>
        </div>
      </td>
    </tr>
    <tr id="desktop-accordion-${it.id}" class="desktop-accordion-row" style="display:none; background:var(--bg2);">
      <td colspan="8" style="padding:12px 16px;">
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
            <div style="background:var(--card); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:10px; color:var(--text3); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Mahal Detayı</div>
              <div style="font-size:13px; font-weight:600; color:var(--text);">${escapeHTML(getMahalName(it.mahalId))} (${escapeHTML(it.kat || '-')})</div>
            </div>
            <div style="background:var(--card); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:10px; color:var(--text3); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Teklif Detayları</div>
              <div style="font-size:13px; font-weight:600; color:var(--text);">Tutar: ${fmtN(it.ttut, it.cur)} (${fmt(it.ttar)})</div>
            </div>
            <div style="background:var(--card); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:10px; color:var(--text3); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Onay &amp; Fatura</div>
              <div style="font-size:13px; font-weight:600; color:var(--text);">Onay: ${fmtN(it.otut, it.cur)} / Fatura: ${fmtN(it.ftut, it.cur)}</div>
            </div>
            <div style="background:var(--card); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:10px; color:var(--text3); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Zaman Akışı</div>
              <div style="font-size:12px; color:var(--text2);">Bas: ${fmt(it.bas)} - Bit: ${fmt(it.bit)}</div>
            </div>
          </div>
          ${it.note ? `<div style="background:var(--card); padding:12px; border-radius:8px; border:1px solid var(--border); font-size:12px; color:var(--text2);"><strong>Not:</strong> ${escapeHTML(it.note)}</div>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
  
  if (mobList) {
    mobList.innerHTML = f.map((it, i) => {
      const od = isOD(it);
      const si = STAT_NAMES.indexOf(it.durum);
      
      const sendIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
      const approveIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      const startIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      const completeIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;
      const editIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      const delIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      const pdfIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
      const invoiceIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;

      const displayName = it.santiye || it.otel || '-';
      const escapedDisplayName = escapeHTML(displayName);
      const fileAttachmentLink = it.fileUrl ? `<a href="${it.fileUrl}" target="_blank" title="Ekli Belge: ${escapeHTML(it.fileName || 'Belgeyi İndir')}" style="text-decoration:none; margin-left:6px; font-size:14px; display:inline-flex; align-items:center; justify-content:center;" onclick="event.stopPropagation();"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></a>` : '';

      const prog = getProgressData(it.durum);
      return `<div class="mobile-card ${od ? 'overdue' : ''}">
        <div class="mobile-card-header" onclick="toggleMobileAccordion('${it.id}')" style="cursor:pointer;">
          <div>
            <div class="mobile-card-title">${escapedDisplayName}${fileAttachmentLink}</div>
            <div class="mobile-card-tags" style="margin-top:6px;">
              <span class="mahal-tag" style="padding:2px 8px;font-size:10px">${escapeHTML(getMahalName(it.mahalId))}</span>
              <span class="badge ${CAT_CLS[it.kat] || 'b-diger'}" style="padding:2px 8px;font-size:10px">${escapeHTML(it.kat || '-')}</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
            <div style="display:flex; align-items:center; gap:4px;">
              <span class="badge ${STAT_CLS[si] || 'b-0'}" style="font-size:11px; padding:4px 8px;">${it.durum || '-'}</span>
              <svg id="mobile-accordion-icon-${it.id}" class="mobile-accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            ${getStepperHtml(it.durum)}
          </div>
        </div>

        <div id="mobile-accordion-${it.id}" class="mobile-accordion-content">        <div class="mobile-card-info-row">
          <div class="mobile-card-info-item">
            <span class="mobile-card-info-lbl">Teklif Tutarı</span>
            <span class="mobile-card-info-val" style="color: var(--primary); white-space:nowrap;">${fmtN(it.ttut, it.cur)}</span>
            <span style="font-size:10px; color:var(--text3);">${fmt(it.ttar)}</span>
          </div>
          <div class="mobile-card-info-item">
            <span class="mobile-card-info-lbl">${it.durum === 'Faturalandı' ? 'Fatura Tutarı' : 'Onay Tutarı'}</span>
            <span class="mobile-card-info-val" style="color: var(--green); white-space:nowrap;">${it.durum === 'Faturalandı' ? fmtN(it.ftut || it.otut, it.cur) : fmtN(it.otut, it.cur)}</span>
            <span style="font-size:10px; color:var(--text3);">${it.durum === 'Faturalandı' ? (it.fno ? '#' + escapeHTML(it.fno) : fmt(it.ftar)) : fmt(it.otar)}</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; border-bottom: 1px dashed var(--border); padding-bottom:10px;">
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--text2)">Takvim (Baş/Bit):</span> <span>${fmt(it.bas)} - ${fmt(it.bit)}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span>${getDynamicDateBadge(it.bas, it.bit, it.durum)}</span>
            ${it.ftar ? `<span style="font-size:11px; color:var(--text3)">Fat: ${fmt(it.ftar)}</span>` : ''}
          </div>
          ${it.htut ? `<div style="display:flex; justify-content:space-between; font-size:11px; color:var(--purple); font-weight:700; margin-top:2px;"><span>Hakediş Tutarı:</span> <span>${fmtN(it.htut, it.cur)}</span></div>` : ''}
        </div>

        <div class="mobile-card-footer">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:10px; color:var(--text3)">Son İşlem:</span>
            <span class="mahal-tag" style="background:var(--primary-color-faded); color:var(--text2); border:1px solid var(--border); padding:2px 6px; font-size:10px; font-weight:700;">${getUserDisplayName(it.lastEditedBy || 'system')}</span>
          </div>
          <div class="mobile-card-actions">
            ${it.durum === 'Gönderilecek' ? `<button class="btn-quick" style="background:var(--primary);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'Gönderildi')" title="Gönder">${sendIcon} Gönder</button>` : ''}
            ${it.durum === 'Gönderildi' ? `<button class="btn-quick" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="quickApprove(event, '${it.id}')" title="Onayla">${approveIcon} Onayla</button>` : ''}
            ${it.durum === 'Onaylandı' ? `<button class="btn-quick" style="background:var(--blue);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'İş Yapım Aşamasında')" title="İşe Başla">${startIcon} Başla</button>` : ''}
            ${it.durum === 'İş Yapım Aşamasında' ? `<button class="btn-quick" style="background:var(--purple);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="quickAction(event, '${it.id}', 'Tamamlandı')" title="İşi Tamamla">${completeIcon} Tamamla</button>` : ''}
            ${it.durum === 'Tamamlandı' ? `<button class="btn-quick" style="background:var(--purple);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="openHakedisModal(event, '${it.id}')" title="Hakediş Gir">${invoiceIcon} Hakediş Gir</button>` : ''}
            ${it.durum === 'Hakediş Onaylandı' ? `<button class="btn-quick" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;display:inline-flex;align-items:center;gap:4px" onclick="openInvoiceModal(event, '${it.id}')" title="Fatura Ekle">${invoiceIcon} Fatura Ekle</button>` : ''}
            
            <button class="btn-quick" style="background:#475569;color:#fff;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;" onclick="generatePDF('${it.id}')" title="PDF İndir">${pdfIcon}</button>
            <button class="btn-edit" style="display:inline-flex;align-items:center;padding:6px 8px; border-radius:6px;" onclick="openModal('${it.id}')" aria-label="${escapedDisplayName} düzenle">${editIcon}</button>
            <button class="btn-del" style="display:inline-flex;align-items:center;padding:6px 8px; border-radius:6px;" onclick="delItem('${it.id}')" aria-label="${escapedDisplayName} sil">${delIcon}</button>
          </div>
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

window.toggleMobileAccordion = function(id) {
  const content = document.getElementById('mobile-accordion-' + id);
  const icon = document.getElementById('mobile-accordion-icon-' + id);
  if(content) {
    content.classList.toggle('open');
    if(icon) {
      icon.classList.toggle('open');
    }
  }
};

let currentStatCurrencyIdx = 0;
let statCurrencyInterval = null;

function updateStats(){
  const t=items.length;
  const on=items.filter(i=>['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum)).length;
  const late=items.filter(isOD).length;
  
  // Calculate sums segmented by currency
  const sums = {
    '₺': items.filter(i => i.cur === '₺' || !i.cur).reduce((s,i) => s + (Number(i.ttut)||0), 0),
    '$': items.filter(i => i.cur === '$').reduce((s,i) => s + (Number(i.ttut)||0), 0),
    '€': items.filter(i => i.cur === '€').reduce((s,i) => s + (Number(i.ttut)||0), 0)
  };
  
  const approvedSums = {
    '₺': items.filter(i => (i.cur === '₺' || !i.cur) && ['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum)).reduce((s,i) => s + (Number(i.otut)||0), 0),
    '$': items.filter(i => i.cur === '$' && ['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum)).reduce((s,i) => s + (Number(i.otut)||0), 0),
    '€': items.filter(i => i.cur === '€' && ['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum)).reduce((s,i) => s + (Number(i.otut)||0), 0)
  };

  const invoicedSums = {
    '₺': items.filter(i => (i.cur === '₺' || !i.cur) && i.durum === 'Faturalandı').reduce((s,i) => s + (Number(i.ftut)||Number(i.otut)||0), 0),
    '$': items.filter(i => i.cur === '$' && i.durum === 'Faturalandı').reduce((s,i) => s + (Number(i.ftut)||Number(i.otut)||0), 0),
    '€': items.filter(i => i.cur === '€' && i.durum === 'Faturalandı').reduce((s,i) => s + (Number(i.ftut)||Number(i.otut)||0), 0)
  };

  const currencyKeys = ['₺', '$', '€'];
  
  const renderCurrencyVal = (curMap, prefix) => {
    const cur = currencyKeys[currentStatCurrencyIdx];
    return `
      <div class="stat-lbl" style="transition: opacity 0.3s ease;">${prefix} ${cur}</div>
      <div class="stat-val" style="transition: opacity 0.3s ease;">
        <span>${curMap[cur].toLocaleString('tr-TR')}\u00A0${cur}</span>
      </div>`;
  };

  const statsHtml = `
    <div class="stat-card clickable" onclick="showStatDetails('all')">
      <div class="stat-lbl">Toplam Teklif</div>
      <div class="stat-val">${t}</div>
    </div>
    <div class="stat-card clickable" onclick="showStatDetails('approved')">
      <div class="stat-lbl">Onaylanan</div>
      <div class="stat-val" style="color:var(--green)">${on}</div>
    </div>
    <div class="stat-card clickable ${late?'red':''}" onclick="showStatDetails('late')">
      <div class="stat-lbl">Geciken</div>
      <div class="stat-val" style="${late ? 'color:var(--red)' : ''}">${late}</div>
    </div>
    <div class="stat-card clickable" id="multiCurrencyStatCard" style="cursor: pointer; user-select: none;">
      <div id="multiCurrencyStatContent">${renderCurrencyVal(sums, 'Toplam Teklif')}</div>
    </div>
    <div class="stat-card clickable" id="approvedCurrencyStatCard" style="cursor: pointer; user-select: none;">
      <div id="approvedCurrencyStatContent">${renderCurrencyVal(approvedSums, 'Toplam Onay')}</div>
    </div>
    <div class="stat-card clickable" id="invoicedCurrencyStatCard" style="cursor: pointer; user-select: none;">
      <div id="invoicedCurrencyStatContent">${renderCurrencyVal(invoicedSums, 'Toplam Fatura')}</div>
    </div>`;
  
  document.getElementById('statsGrid').innerHTML = statsHtml;

  const cards = ['multiCurrencyStatCard', 'approvedCurrencyStatCard', 'invoicedCurrencyStatCard'];
  const contents = ['multiCurrencyStatContent', 'approvedCurrencyStatContent', 'invoicedCurrencyStatContent'];
  const maps = [sums, approvedSums, invoicedSums];
  const prefixes = ['Toplam Teklif', 'Toplam Onay', 'Toplam Fatura'];

  const cycleCurrency = (dir = 1) => {
    contents.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(4px)';
      }
    });
    setTimeout(() => {
      currentStatCurrencyIdx = (currentStatCurrencyIdx + dir + 3) % 3;
      contents.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = renderCurrencyVal(maps[idx], prefixes[idx]);
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, 200);
  };

  cards.forEach(cardId => {
    const cardEl = document.getElementById(cardId);
    if (cardEl) {
      cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleCurrency(1);
        resetStatTimer();
      });

      cardEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = e.deltaY > 0 ? 1 : -1;
        cycleCurrency(dir);
        resetStatTimer();
      }, { passive: false });
    }
  });

  function resetStatTimer() {
    if (statCurrencyInterval) clearInterval(statCurrencyInterval);
    statCurrencyInterval = setInterval(() => {
      cycleCurrency(1);
    }, 10000);
  }

  resetStatTimer();

  if (document.getElementById('page_admin') && document.getElementById('page_admin').classList.contains('active')) {
    try { renderAdminPanel(); } catch(e){}
  }
}

function checkOverdue(){
  const late=items.filter(isOD);
  const b=document.getElementById('odBanner');
  if(late.length){document.getElementById('odMsg').textContent=`${late.length} teklifin iş bitiş tarihi geçti ve hâlâ aktif durumda!`;b.classList.add('show');}
  else b.classList.remove('show');
}

// ── Modal ─────────────────────────────────────────────────────
// ── Modal ─────────────────────────────────────────────────────
function openModal(idx){
  editIdx=idx;
  const isEdit=(idx!==null&&idx!==-1&&typeof idx==='string');
  document.getElementById('modalTitle').textContent=isEdit?'Teklif Düzenle':'Yeni Teklif Ekle';
  document.getElementById('saveBtn').textContent=isEdit?'Güncelle':'Kaydet';
  document.getElementById('saveBtn').setAttribute('aria-label', isEdit ? 'Teklif detaylarını güncelle' : 'Yeni teklif kaydet');
  document.getElementById('newMahalRow').style.display = 'none';
  document.getElementById('f_new_mahal').value='';
  
  if(isEdit){
    const it=items.find(x=>x.id===idx);
    if(!it)return;
    populateModalMahal(it.mahalId||'');
    document.getElementById('f_otel').value=it.otel||'';
    document.getElementById('f_kat').value=it.kat||'İnşaat';
    document.getElementById('f_durum').value=it.durum||'Gönderilecek';
    document.getElementById('f_ttar').value=it.ttar||'';
    document.getElementById('f_ttut').value=it.ttut||'';
    document.getElementById('f_cur').value=it.cur||'₺';
    document.getElementById('f_otar').value=it.otar||'';
    document.getElementById('f_otut').value=it.otut||'';
    document.getElementById('f_bas').value=it.bas||'';
    document.getElementById('f_bit').value=it.bit||'';
    document.getElementById('f_htut').value=it.htut||'';
    document.getElementById('f_fno').value=it.fno||'';
    document.getElementById('f_ftut').value=it.ftut||'';
    document.getElementById('f_ftar').value=it.ftar||'';
    
    // File fields population
    document.getElementById('f_fileUrl').value = it.fileUrl || '';
    document.getElementById('f_fileName').value = it.fileName || '';
    document.getElementById('f_file').value = '';
    document.getElementById('fileUploadProgress').style.display = 'none';
    if (it.fileUrl) {
      const fileLink = document.getElementById('attachedFileName');
      fileLink.textContent = it.fileName || 'Dosya';
      fileLink.href = it.fileUrl;
      document.getElementById('attachedFileContainer').style.display = 'flex';
    } else {
      document.getElementById('attachedFileContainer').style.display = 'none';
    }
    
    // Set dynamic date boundaries
    document.getElementById('f_bit').min = it.bas || '';
    document.getElementById('f_bas').max = it.bit || '';
    
    resetModalAccordions(it);
  } else {
    const activeMahal = document.getElementById('fMahal').value;
    const activeCat = document.getElementById('fCat').value;
    
    populateModalMahal(activeMahal || '');
    ['f_otel','f_ttut','f_otar','f_otut','f_bas','f_bit','f_htut','f_fno','f_ftut','f_ftar'].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('f_ttar').value = today();
    
    // Reset file fields
    document.getElementById('f_fileUrl').value = '';
    document.getElementById('f_fileName').value = '';
    document.getElementById('f_file').value = '';
    document.getElementById('attachedFileContainer').style.display = 'none';
    document.getElementById('fileUploadProgress').style.display = 'none';
    
    // Reset date boundaries
    document.getElementById('f_bit').min = '';
    document.getElementById('f_bas').max = '';
    
    // Otomatik meslek -> kategori eşleştirme
    let defaultKat = activeCat || 'İnşaat';
    if (!activeCat) {
      let userJob = "";
      if (currentUser) {
        const raw = localStorage.getItem('profile_' + currentUser.u);
        if (raw) userJob = JSON.parse(raw).job || '';
        else userJob = document.getElementById('prof_job').value;
      }
      if (userJob === 'Makine Mühendisi') defaultKat = 'Mekanik';
      else if (userJob === 'Elektrik Mühendisi') defaultKat = 'Elektrik';
    }
    
    document.getElementById('f_kat').value = defaultKat;
    document.getElementById('f_durum').value='Gönderilecek';
    document.getElementById('f_cur').value='₺';
    
    resetModalAccordions(null);
  }
  updateCur2Lbl();
  document.getElementById('modalBg').classList.add('open');
  document.getElementById('f_mahal').focus();
}

async function closeModal(){
  if (window.currentFormState && window.currentFormState !== getFormState('modalBg')) {
    const ok = await showConfirm("Kaydedilmemiş Değişiklikler", "Kaydedilmemiş değişiklikler var, çıkmak istiyor musunuz?", true);
    if (!ok) return;
  }
  window.currentFormState = "";
  document.getElementById('modalBg').classList.remove('open');
  editIdx=-1;
}
function updateCur2Lbl(){document.getElementById('f_cur2_lbl').textContent=document.getElementById('f_cur').value;}

function toggleNewMahal(){
  const row=document.getElementById('newMahalRow'),show=(row.style.display==='none');
  row.style.display = show ? 'flex' : 'none';
  if(show){
    document.getElementById('f_mahal').value='';
    document.getElementById('f_new_mahal').focus();
  }
}
function onMahalSel(){
  if(document.getElementById('f_mahal').value) {
    document.getElementById('newMahalRow').style.display = 'none';
  }
}

// ── DİNAMİK YENİ MAHAL EKLEME ──────────────────────────────────────
async function addMahalFromModal() {
  const input = document.getElementById('f_new_mahal');
  const v = input.value.trim();
  if(!v){showToast('Mahal adı boş olamaz!', 'error');return;}
  
  // Mükerrer kontrolü
  const ex = mahals.find(m => m.name.toLowerCase() === v.toLowerCase());
  if(ex){
    populateModalMahal(ex.id);
    populateMahalFilter();
    toggleNewMahal();
    input.value = '';
    return;
  }
  
  try {
    const ref = await col('mahals').add({name: v});
    populateModalMahal(ref.id); // Dropdown'a ekle ve hemen otomatik seç!
    toggleNewMahal();
    input.value = '';
    showToast('Mahal başarıyla eklendi.');
  } catch(e) {
    showToast('Mahal eklenirken hata oluştu: ' + e.message, 'error');
  }
}

// ── Dosya Yükleme Yardımcıları (Firebase Storage) ──────────────
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const progressDiv = document.getElementById('fileUploadProgress');
  const percentText = document.getElementById('fileUploadPercent');
  const bar = document.getElementById('fileUploadBar');
  const container = document.getElementById('attachedFileContainer');
  const nameSpan = document.getElementById('attachedFileName');
  const urlInput = document.getElementById('f_fileUrl');
  const nameInput = document.getElementById('f_fileName');

  // Arayüz sıfırlama
  container.style.display = 'none';
  progressDiv.style.display = 'block';
  percentText.textContent = '0%';
  bar.style.width = '0%';

  try {
    // Güvenli dosya adı üretimi
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
    const storagePath = `teklifler/${Date.now()}_${cleanBaseName}${fileExt}`;
    
    const storageRef = storage.ref().child(storagePath);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        percentText.textContent = progress + '%';
        bar.style.width = progress + '%';
      }, 
      (error) => {
        progressDiv.style.display = 'none';
        showToast('Dosya yüklenirken hata oluştu: ' + error.message, 'error');
      }, 
      async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          urlInput.value = downloadURL;
          nameInput.value = file.name;

          // Yükleme durumu arayüz güncellemesi
          progressDiv.style.display = 'none';
          nameSpan.textContent = file.name;
          nameSpan.title = file.name;
          nameSpan.href = downloadURL;
          container.style.display = 'flex';
          showToast('Dosya başarıyla yüklendi.');
        } catch (error) {
          progressDiv.style.display = 'none';
          showToast('Dosya URL alınırken hata oluştu: ' + error.message, 'error');
        }
      }
    );
  } catch (err) {
    progressDiv.style.display = 'none';
    showToast('Yükleme başlatılamadı: ' + err.message, 'error');
  }
}

function removeAttachedFile() {
  document.getElementById('f_file').value = '';
  document.getElementById('f_fileUrl').value = '';
  document.getElementById('f_fileName').value = '';
  document.getElementById('attachedFileContainer').style.display = 'none';
  document.getElementById('fileUploadProgress').style.display = 'none';
  showToast('Dosya bağlantısı kaldırıldı.');
}

async function saveItem(){
  const btn=document.getElementById('saveBtn');
  btn.disabled=true;btn.textContent='Kaydediliyor...';
  try{
    let mahalId=document.getElementById('f_mahal').value;
    const newMahalInput = document.getElementById('f_new_mahal');
    const newMahalVal = newMahalInput ? newMahalInput.value.trim() : '';

    if (!mahalId && newMahalVal) {
      const ex = mahals.find(m => m.name.toLowerCase() === newMahalVal.toLowerCase());
      if (ex) {
        mahalId = ex.id;
      } else {
        const ref = await col('mahals').add({name: newMahalVal});
        mahalId = ref.id;
      }
      newMahalInput.value = '';
      document.getElementById('newMahalRow').style.display = 'none';
    }
    
    if(!mahalId){
      shakeElement('f_mahal');
      showToast('Lütfen bir işveren seçin veya yeni işveren oluşturun!', 'error');
      btn.disabled=false;
      btn.textContent=document.getElementById('modalTitle').textContent==='Teklif Düzenle'?'Güncelle':'Kaydet';
      return;
    }
    const otel=document.getElementById('f_otel').value.trim();
    if(!otel){
      shakeElement('f_otel');
      showToast('Otel/proje adı gereklidir!', 'error');
      btn.disabled=false;
      btn.textContent=document.getElementById('modalTitle').textContent==='Teklif Düzenle'?'Güncelle':'Kaydet';
      return;
    }
    
    const ttutVal = Number(document.getElementById('f_ttut').value) || 0;
    const otutVal = Number(document.getElementById('f_otut').value) || 0;
    const htutVal = Number(document.getElementById('f_htut').value) || 0;
    const ftutVal = Number(document.getElementById('f_ftut').value) || 0;
    if(ttutVal < 0 || otutVal < 0 || htutVal < 0 || ftutVal < 0) {
      showToast('Teklif, onay, hakediş veya fatura tutarı negatif olamaz!', 'error');
      btn.disabled=false;
      btn.textContent=document.getElementById('modalTitle').textContent==='Teklif Düzenle'?'Güncelle':'Kaydet';
      return;
    }
    
    const basVal = document.getElementById('f_bas').value;
    const bitVal = document.getElementById('f_bit').value;
    if(basVal && bitVal && bitVal < basVal) {
      showToast('İş bitiş tarihi, başlangıç tarihinden daha eski olamaz!', 'error');
      btn.disabled=false;
      btn.textContent=document.getElementById('modalTitle').textContent==='Teklif Düzenle'?'Güncelle':'Kaydet';
      return;
    }
    
    const data={
      mahalId,
      otel: otel,
      santiye: otel,
      kat:document.getElementById('f_kat').value,
      durum:document.getElementById('f_durum').value,
      ttar:document.getElementById('f_ttar').value||'',
      ttut:ttutVal ? String(ttutVal) : '',
      cur:document.getElementById('f_cur').value,
      otar:document.getElementById('f_otar').value||'',
      otut:otutVal ? String(otutVal) : '',
      bas:basVal||'',
      bit:bitVal||'',
      htut:htutVal ? String(htutVal) : '',
      fno:document.getElementById('f_fno').value.trim(),
      ftut:ftutVal ? String(ftutVal) : '',
      ftar:document.getElementById('f_ftar').value||'',
      fileUrl: document.getElementById('f_fileUrl').value || '',
      fileName: document.getElementById('f_fileName').value || '',
      lastEditedBy: currentUser ? currentUser.u : 'system'
    };
    
    const isEdit=(editIdx!==null&&editIdx!==-1&&typeof editIdx==='string');
    if(isEdit){
      await col('items').doc(editIdx).update(data);
      if (typeof logAction === 'function') logAction('Güncelleme', 'Teklif', editIdx, data.otel + ' projesi için teklif güncellendi');
      showToast('Teklif başarıyla güncellendi.');
    } else {
      data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
      await col('items').add(data);
      if (typeof logAction === 'function') logAction('Ekleme', 'Teklif', 'new', data.otel + ' projesi için teklif eklendi');
      showToast('Yeni teklif başarıyla eklendi.');
      
      if (convertingSurveyId) {
        try {
          await col('surveys').doc(convertingSurveyId).update({ durum: 'Teklife Dönüştü' });
          convertingSurveyId = null;
        } catch (e) {
          console.error("Survey status update failed:", e);
        }
      }
    }
    window.currentFormState = "";
    closeModal();
  }catch(e){
    showToast('Teklif kaydedilirken bir hata oluştu: ' + e.message, 'error');
  }finally{
    btn.disabled=false;
    btn.textContent=document.getElementById('modalTitle').textContent==='Teklif Düzenle'?'Güncelle':'Kaydet';
  }
}

async function quickAddSave() {
  const otel = document.getElementById('qa_otel').value.trim();
  const mahalId = document.getElementById('qa_mahal').value;
  const kat = document.getElementById('qa_kat').value;
  const ttutVal = Number(document.getElementById('qa_ttut').value) || 0;
  const cur = document.getElementById('qa_cur').value;
  
  if (!otel) {
    showToast('Proje/Şantiye adı gereklidir!', 'error');
    return;
  }
  if (!mahalId) {
    showToast('Lütfen bir mahal seçin!', 'error');
    return;
  }
  if (ttutVal < 0) {
    showToast('Tutar negatif olamaz!', 'error');
    return;
  }
  
  const data = {
    mahalId,
    otel: otel,
    santiye: otel,
    kat,
    durum: 'Gönderilecek',
    ttar: today(),
    ttut: ttutVal ? String(ttutVal) : '',
    cur,
    otar: '',
    otut: '',
    bas: '',
    bit: '',
    ftar: '',
    lastEditedBy: currentUser ? currentUser.u : 'system',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    const ref = await col('items').add(data);
    if (typeof logAction === 'function') logAction('Hızlı Ekleme', 'Teklif', ref.id, data.otel + ' projesi için teklif hızlı eklendi');
    showToast('Teklif hızlıca eklendi.');
    document.getElementById('qa_otel').value = '';
    document.getElementById('qa_ttut').value = '';
    
    // Sync with active filter values if set
    const activeMahal = document.getElementById('fMahal').value;
    const activeCat = document.getElementById('fCat').value;
    if (activeMahal) document.getElementById('qa_mahal').value = activeMahal;
    if (activeCat) document.getElementById('qa_kat').value = activeCat;
    
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
  } catch(e) {
    showToast('Teklif eklenirken hata: ' + e.message, 'error');
  }
}

async function delItem(id){
  const ok = await showConfirm('Teklifi Sil', 'Bu teklifi silmek istediğinize emin misiniz?', true);
  if(!ok)return;
  const it = items.find(x => x.id === id);
  try{
    if (it && it.fileUrl) {
      try {
        await storage.refFromURL(it.fileUrl).delete();
      } catch (storageErr) {
        console.error("Storage file deletion error (ignored):", storageErr);
      }
    }
    await col('items').doc(id).delete();
    if (typeof logAction === 'function' && it) logAction('Silme', 'Teklif', id, it.otel + ' projesi için teklif silindi');
    showToast('Teklif başarıyla silindi.');
  }catch(e){showToast('Teklif silinirken hata: ' + e.message, 'error');}
}

// ── Quick Actions (Hızlı Eylemler) ────────────────────────────────
async function quickAction(event, id, nextStat){
  try {
    const it = items.find(x => x.id === id);
    if(!it) return;
    
    let updates = { durum: nextStat, lastEditedBy: currentUser ? currentUser.u : 'system' };
    if (nextStat === 'İş Yapım Aşamasında' && !it.bas) updates.bas = today();
    if (nextStat === 'Tamamlandı' && !it.bit) updates.bit = today();
    
    await col('items').doc(id).update(updates);
    if (typeof logAction === 'function') logAction('Durum Güncelleme', 'Teklif', id, (it ? it.otel : '') + ' durumu ' + nextStat + ' olarak güncellendi');
    showToast('Durum güncellendi: ' + nextStat);
    
    // Confetti blast on click coordinates
    const cx = event ? event.clientX : window.innerWidth / 2;
    const cy = event ? event.clientY : window.innerHeight / 2;
    triggerConfetti(cx, cy);
  } catch(e) {
    showToast('Durum güncellenirken hata: ' + e.message, 'error');
  }
}

let currentApproveId = null;

function closeApproveModal() {
  document.getElementById('approveModalBg').classList.remove('open');
  currentApproveId = null;
}

function quickApprove(event, id){
  const it = items.find(x => x.id === id);
  if(!it) return;
  
  currentApproveId = id;
  document.getElementById('approveModalDesc').innerHTML = `<b>${escapeHTML(it.otel || 'Bu teklif')}</b> isimli projeyi onaylamak üzeresiniz. Lütfen onaylanan tutarı giriniz.`;
  document.getElementById('approve_otut').value = it.ttut || '';
  document.getElementById('approve_ocur').value = it.cur || '₺';
  
  const saveBtn = document.getElementById('btnApproveSave');
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Onaylanıyor...';
    try {
      const tutarVal = document.getElementById('approve_otut').value;
      const numTutar = Number(tutarVal) || 0;
      if (numTutar < 0) {
        showToast("Onay tutarı 0'dan küçük olamaz.", 'error');
        return;
      }
      
      const curVal = document.getElementById('approve_ocur').value;
      let updates = { durum: 'Onaylandı', otut: String(numTutar), cur: curVal, lastEditedBy: currentUser ? currentUser.u : 'system' };
      if (!it.otar) updates.otar = today(); // Otomatik onay tarihi
      
      await col('items').doc(currentApproveId).update(updates);
      
      showToast('Teklif başarıyla onaylandı.');
      closeApproveModal();
      
      // Center of screen confetti blast for modal approvals
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
    } catch(e) {
      showToast('Onay işlemi sırasında hata: ' + e.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Onayla';
    }
  };
  
  document.getElementById('approveModalBg').classList.add('open');
  document.getElementById('approve_otut').focus();
}

let currentHakedisId = null;

function closeHakedisModal() {
  document.getElementById('hakedisModalBg').classList.remove('open');
  currentHakedisId = null;
}

function openHakedisModal(event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const it = items.find(x => x.id === id);
  if (!it) return;
  
  currentHakedisId = id;
  document.getElementById('hakedisModalDesc').innerHTML = `<b>${escapeHTML(it.santiye || it.otel || 'Bu teklif')}</b> isimli proje için hakediş tutarını giriniz.`;
  document.getElementById('hakedis_htut').value = it.htut || it.otut || it.ttut || '';
  document.getElementById('hakedis_ocur').textContent = it.cur || '₺';
  
  const saveBtn = document.getElementById('btnHakedisSave');
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    try {
      const htutVal = document.getElementById('hakedis_htut').value;
      const numHtut = Number(htutVal) || 0;
      if (numHtut < 0) {
        showToast("Hakediş tutarı 0'dan küçük olamaz.", 'error');
        return;
      }
      
      let updates = {
        durum: 'Hakediş Onaylandı',
        htut: String(numHtut),
        lastEditedBy: currentUser ? currentUser.u : 'system'
      };
      
      await col('items').doc(currentHakedisId).update(updates);
      if (typeof logAction === 'function') logAction('Güncelleme', 'Hakediş', currentHakedisId, it.otel + ' hakediş durumu güncellendi');
      
      showToast('Hakediş başarıyla girildi.');
      closeHakedisModal();
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
    } catch(e) {
      showToast('Hakediş kaydedilirken hata: ' + e.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>Hakedişi Kaydet';
    }
  };
  
  document.getElementById('hakedisModalBg').classList.add('open');
  document.getElementById('hakedis_htut').focus();
}

// ── Accordion Helpers ─────────────────────────────────────────
function toggleAccordion(header, contentId, forceOpen) {
  const content = document.getElementById(contentId);
  if (!content) return;
  const willOpen = forceOpen !== undefined ? forceOpen : !content.classList.contains('open');
  if (willOpen) {
    content.classList.add('open');
    header.classList.add('open');
  } else {
    content.classList.remove('open');
    header.classList.remove('open');
  }
}

function resetModalAccordions(it) {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(h => {
    h.classList.remove('open');
  });
  const contents = document.querySelectorAll('.accordion-content');
  contents.forEach(c => {
    c.classList.remove('open');
  });
  
  if (it) {
    if (it.otar || it.otut) {
      const h = document.querySelector('.accordion-header[onclick*="accOnay"]');
      if (h) toggleAccordion(h, 'accOnay', true);
    }
    if (it.bas || it.bit) {
      const h = document.querySelector('.accordion-header[onclick*="accTakvim"]');
      if (h) toggleAccordion(h, 'accTakvim', true);
    }
    if (it.htut) {
      const h = document.querySelector('.accordion-header[onclick*="accHakedis"]');
      if (h) toggleAccordion(h, 'accHakedis', true);
    }
    if (it.ftar || it.fno || it.ftut) {
      const h = document.querySelector('.accordion-header[onclick*="accFatura"]');
      if (h) toggleAccordion(h, 'accFatura', true);
    }
    if (it.fileUrl) {
      const h = document.querySelector('.accordion-header[onclick*="accDosya"]');
      if (h) toggleAccordion(h, 'accDosya', true);
    }
  }
}

let currentInvoiceId = null;

function closeInvoiceModal() {
  document.getElementById('invoiceModalBg').classList.remove('open');
  currentInvoiceId = null;
}

function openInvoiceModal(event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const it = items.find(x => x.id === id);
  if (!it) return;

  currentInvoiceId = id;
  document.getElementById('invoiceModalDesc').innerHTML = `<b>${escapeHTML(it.santiye || it.otel || 'Bu teklif')}</b> isimli proje için fatura detaylarını giriniz.`;
  document.getElementById('invoice_fno').value = it.fno || '';
  document.getElementById('invoice_ftut').value = it.ftut || it.htut || it.otut || it.ttut || '';
  document.getElementById('invoice_ocur').textContent = it.cur || '₺';
  document.getElementById('invoice_ftar').value = it.ftar || today();

  const saveBtn = document.getElementById('btnInvoiceSave');
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    try {
      const fnoVal = document.getElementById('invoice_fno').value.trim();
      const ftutVal = document.getElementById('invoice_ftut').value;
      const ftarVal = document.getElementById('invoice_ftar').value;

      const numFtut = Number(ftutVal) || 0;
      if (numFtut < 0) {
        showToast("Fatura tutarı 0'dan küçük olamaz.", 'error');
        return;
      }

      let updates = {
        durum: 'Faturalandı',
        fno: fnoVal,
        ftut: String(numFtut),
        ftar: ftarVal,
        lastEditedBy: currentUser ? currentUser.u : 'system'
      };

      await col('items').doc(currentInvoiceId).update(updates);
      const idx = items.findIndex(x => x.id === currentInvoiceId);
      if (idx >= 0) items[idx] = { ...items[idx], ...updates };

      showToast('Fatura başarıyla kaydedildi ve durum Faturalandı olarak güncellendi.');
      closeInvoiceModal();

      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);

      render(); updateStats(); checkOverdue();
    } catch(e) {
      showToast('Fatura kaydedilirken hata oluştu: ' + e.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>Faturayı Kaydet';
    }
  };

  document.getElementById('invoiceModalBg').classList.add('open');
  document.getElementById('invoice_fno').focus();
}

// ── Excel Export ──────────────────────────────────────────────
function exportExcel(){
  const q=(document.getElementById('srch').value||'').toLowerCase();
  const cat=document.getElementById('fCat').value;
  const stat=document.getElementById('fStat').value;
  const mah=document.getElementById('fMahal').value;
  
  let filteredItems = items.filter(it=>{
    const nameVal = it.santiye || it.otel || '';
    if(q&&!nameVal.toLowerCase().includes(q)&&!getMahalName(it.mahalId).toLowerCase().includes(q))return false;
    if(cat&&it.kat!==cat)return false;
    if(stat&&it.durum!==stat)return false;
    if(mah&&it.mahalId!==mah)return false;
    return true;
  });

  filteredItems.sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    
    if (sortKey === 'ttut' || sortKey === 'otut') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else if (sortKey === 'ttar' || sortKey === 'otar' || sortKey === 'bas' || sortKey === 'bit') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }
    
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const hdrs=['#','İşveren','Şantiye / Otel','Kategori','Durum','Teklif Tarihi','Teklif Tutarı (KDV Hariç)','Para Birimi','Onay Tarihi','Onay Tutarı (KDV Hariç)','Başlangıç','Bitiş','Gecikme','Fatura Tarihi','Fatura No','Fatura Tutarı (KDV Hariç)'];
  const rows=filteredItems.map((it,i)=>[
    i+1,
    String(getMahalName(it.mahalId) || ''),
    String(it.santiye || it.otel || ''),
    String(it.kat || ''),
    String(it.durum || ''),
    String(fmt(it.ttar)),
    it.ttut ? Number(it.ttut) || 0 : '',
    String(it.cur || '₺'),
    String(fmt(it.otar)),
    it.otut ? Number(it.otut) || 0 : '',
    String(fmt(it.bas)),
    String(fmt(it.bit)),
    isOD(it) ? 'GECİKME VAR' : '',
    String(fmt(it.ftar)),
    String(it.fno || ''),
    it.ftut ? Number(it.ftut) || 0 : ''
  ]);

  // Döviz bazında dinamik toplam satırlarının hesaplanması
  const currencies = ['₺', '$', '€'];
  const summaryRows = [];
  currencies.forEach(cur => {
    const curItems = filteredItems.filter(it => (it.cur || '₺') === cur);
    if (!curItems.length) return;

    const sumT = curItems.reduce((s, it) => s + (Number(it.ttut) || 0), 0);
    const sumO = curItems.filter(it => ['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(it.durum)).reduce((s, it) => s + (Number(it.otut) || 0), 0);
    const sumF = curItems.filter(it => it.durum === 'Faturalandı').reduce((s, it) => s + (Number(it.ftut) || Number(it.otut) || 0), 0);

    summaryRows.push([
      '', 
      `TOPLAM (${cur})`, 
      '', 
      '', 
      '', 
      '', 
      sumT, 
      cur, 
      '', 
      sumO, 
      '', 
      '', 
      '', 
      '', 
      '', 
      sumF
    ]);
  });

  const allRows = [...rows, ...summaryRows];

  try {
    if (typeof XLSX === 'undefined') {
      // Fallback: Generate UTF-8 CSV with BOM so Microsoft Excel opens it perfectly with Turkish characters
      const csvHdrs = hdrs.join(';');
      const csvRows = allRows.map(r => r.map(val => {
        const str = String(val === null || val === undefined ? '' : val);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(';'));
      
      const csvContent = "\ufeff" + [csvHdrs, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const d = new Date();
      const filename = `YSR_Teklifler_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Excel/CSV dosyası başarıyla indirildi (Kütüphane Yedek Modu).', 'info');
      return;
    }

    const ws=XLSX.utils.aoa_to_sheet([hdrs,...allRows]);
    
    // Tutar sütunlarını (G, J, P) Excel finansal sayı formatına (#,##0.00) dönüştür
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        [6, 9, 15].forEach(C => {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellRef];
          if (cell && typeof cell.v === 'number') {
            cell.t = 'n';
            cell.z = '#,##0.00';
          }
        });
      }
    }

    ws['!cols']=[4,20,24,12,22,14,22,10,14,22,12,12,14,14,16,22].map(w=>({wch:w}));
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,'Teklifler',ws);
    const d=new Date();
    XLSX.writeFile(wb,`YSR_Teklifler_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.xlsx`);
    showToast('Excel dosyası başarıyla indirildi.');
  } catch (err) {
    showToast('Excel dışa aktarma hatası: ' + err.message, 'error');
    console.error(err);
  }
}

// ── Stat Detayları (Drill-Down) ────────────────────────────────
let lastActiveTab = 'teklifler';

function goBackFromStats() {
  document.getElementById('page_stat_detail').classList.remove('active');
  document.getElementById('page_' + lastActiveTab).classList.add('active');
}

function showStatDetails(type) {
  if (document.getElementById('page_analiz').classList.contains('active')) {
    lastActiveTab = 'analiz';
  } else {
    lastActiveTab = 'teklifler';
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page_stat_detail').classList.add('active');
  
  let f = items;
  let title = "Tüm Teklifler";
  
  if (type === 'approved') {
    f = items.filter(i => ['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum));
    title = "Onaylanan Teklifler";
  } else if (type === 'late') {
    f = items.filter(isOD);
    title = "Geciken Teklifler";
  } else if (type === 'active') {
    f = items.filter(i => ['Onaylandı','İş Yapım Aşamasında'].includes(i.durum));
    title = "Aktif Yapım Aşamasındaki Teklifler";
  } else if (type.startsWith('category_')) {
    const cat = type.replace('category_', '');
    f = items.filter(i => i.kat === cat);
    title = `${cat} Kategorisindeki Teklifler`;
  } else if (type.startsWith('status_')) {
    const stat = type.replace('status_', '');
    f = items.filter(i => i.durum === stat);
    title = `"${stat}" Durumundaki Teklifler`;
  }
  
  document.getElementById('statDetailTitle').textContent = title + ` (${f.length})`;
  
  const tb = document.getElementById('statDetailTbody');
  const mobList = document.getElementById('mobileStatDetailWrap');
  if(!tb && !mobList) return;
  
  if(!f.length){
    if (tb) {
      tb.innerHTML=`<tr class="empty-row">
        <td colspan="6" style="padding: 60px 20px; text-align: center; background:transparent;">
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;">
            <svg class="empty-state-svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Harika! Kayıt Bulunmuyor</div>
              <div style="font-size: 13px; color: var(--text2);">Bu grupta bekleyen veya geciken herhangi bir işlem bulunmamaktadır. İşler yolunda!</div>
            </div>
          </div>
        </td>
      </tr>`;
    }
    if (mobList) {
      mobList.innerHTML = `<div class="empty-row" style="padding:40px 16px; text-align:center;">
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
          <svg class="empty-state-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.9;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div style="font-size:14px; font-weight:700; color:var(--text);">Harika! Kayıt Bulunmuyor</div>
        </div>
      </div>`;
    }
    return;
  }
  
  if (tb) {
    tb.innerHTML = f.map((it, i) => {
      const od = isOD(it);
      const si = STAT_NAMES.indexOf(it.durum);
      return `<tr class="${od?'overdue':''}">
        <td style="color:var(--text2);font-weight:600">${i+1}</td>
        <td>
          <div style="font-weight:700;max-width:180px;white-space:normal;line-height:1.3;margin-bottom:6px" title="${escapeHTML(it.otel||'')}">${escapeHTML(it.otel||'-')}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span class="mahal-tag" style="padding:2px 8px;font-size:10px">${escapeHTML(getMahalName(it.mahalId))}</span>
            <span class="badge ${CAT_CLS[it.kat]||'b-diger'}" style="padding:2px 8px;font-size:10px">${escapeHTML(it.kat||'-')}</span>
          </div>
        </td>
        <td><span class="badge ${STAT_CLS[si]||'b-0'}">${escapeHTML(it.durum||'-')}</span></td>
        <td>
          <div style="font-size:13px;color:var(--text2);margin-bottom:4px">${escapeHTML(fmt(it.ttar))}</div>
          <div style="font-weight:700; white-space:nowrap;">${escapeHTML(fmtN(it.ttut,it.cur))}</div>
        </td>
        <td>
          <div style="font-size:13px;color:var(--text2);margin-bottom:4px">${escapeHTML(fmt(it.otar))}</div>
          <div style="font-weight:700; white-space:nowrap;">${escapeHTML(fmtN(it.otut,it.cur))}</div>
        </td>
        <td>
          <div style="font-size:12px;margin-bottom:4px"><span style="color:var(--text2)">Baş:</span> ${escapeHTML(fmt(it.bas))}</div>
          <div style="font-size:12px;margin-bottom:4px"><span style="color:var(--text2)">Bit:</span> ${escapeHTML(fmt(it.bit))}${od?'<span class="warn-icon" title="Gecikti" style="display:inline-flex; margin-left:4px; color:var(--red)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>':''}</div>
          <div>${getDynamicDateBadge(it.bas, it.bit, it.durum)}</div>
          <div style="font-size:12px"><span style="color:var(--text2)">Fat:</span> ${escapeHTML(fmt(it.ftar))}</div>
        </td>
      </tr>`;
    }).join('');
  }

  if (mobList) {
    mobList.innerHTML = f.map((it, i) => {
      const od = isOD(it);
      const si = STAT_NAMES.indexOf(it.durum);
      return `<div class="mobile-card ${od?'overdue':''}" style="padding:14px; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:6px;">
          <span style="font-weight:700; font-size:13px; color:var(--text);">${escapeHTML(it.otel||'-')}</span>
          <span class="badge ${STAT_CLS[si]||'b-0'}" style="font-size:10px; padding:2px 8px;">${escapeHTML(it.durum||'-')}</span>
        </div>
        <div style="font-size:12px; color:var(--text2); display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">
          <span class="mahal-tag" style="padding:2px 6px; font-size:9px;">${escapeHTML(getMahalName(it.mahalId))}</span>
          <span class="badge ${CAT_CLS[it.kat]||'b-diger'}" style="padding:2px 6px; font-size:9px;">${escapeHTML(it.kat||'-')}</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; margin-top:4px;">
          <div>
            <div style="color:var(--text2); font-size:11px;">Teklif Tutarı</div>
            <div style="font-weight:700; color:var(--text);">${escapeHTML(fmtN(it.ttut,it.cur))}</div>
          </div>
          <div>
            <div style="color:var(--text2); font-size:11px;">Onay Tutarı</div>
            <div style="font-weight:700; color:var(--text);">${escapeHTML(fmtN(it.otut,it.cur))}</div>
          </div>
        </div>
        <div style="border-top:1px dashed var(--border); padding-top:6px; font-size:11px; color:var(--text2); display:flex; flex-direction:column; gap:2px;">
          <div>Başlangıç: <span style="color:var(--text); font-weight:600;">${escapeHTML(fmt(it.bas))}</span> | Bitiş: <span style="color:var(--text); font-weight:600;">${escapeHTML(fmt(it.bit))}</span></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span>${getDynamicDateBadge(it.bas, it.bit, it.durum)}</span>
            ${it.ftar ? `<span>Fatura: <span style="color:var(--text); font-weight:600;">${escapeHTML(fmt(it.ftar))}</span></span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

// OTOMATİK İLK HARF BÜYÜTME Removed by User Request

// ── Command Palette (Ctrl+K) ──────────────────────────────────
window.openCmdPalette = function() {
  const palette = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdSearchInput');
  if (palette) {
    palette.style.display = 'flex';
    setTimeout(() => {
      palette.classList.add('active');
      if (input) {
        input.value = '';
        if (typeof handleCmdSearch === 'function') handleCmdSearch('');
        input.focus();
      }
    }, 10);
  }
};

window.closeCmdPalette = function(e) {
  if (e && e.target && e.target.closest('.cmd-palette') && !e.target.closest('.cmd-item')) return;
  const palette = document.getElementById('cmdPalette');
  if (palette) {
    palette.classList.remove('active');
    setTimeout(() => {
      palette.style.display = 'none';
    }, 300);
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const palette = document.getElementById('cmdPalette');
    if (palette && palette.style.display === 'flex') {
      closeCmdPalette();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdPalette();
  }
});

window.handleCmdSearch = function(val) {
  const items = document.querySelectorAll('.cmd-item');
  const term = val.toLowerCase();
  items.forEach(item => {
    const text = item.querySelector('.cmd-text').textContent.toLowerCase();
    if (text.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
};

window.executeCmd = function(action) {
  closeCmdPalette();
  if (action === 'new_proposal') {
    if (typeof showTab === 'function') showTab('teklifler');
    if (typeof openModal === 'function') openModal();
  } else if (action === 'new_report') {
    if (typeof showTab === 'function') showTab('raporlar');
    if (typeof clearReportForm === 'function') clearReportForm();
  } else if (action === 'go_dashboard') {
    if (typeof showTab === 'function') showTab('analiz');
  }
};

// ── Voice Dictation (Sesle Veri Girişi) ────────────────────────
window.toggleVoiceDictation = function(targetId) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Tarayıcınız sesle yazdırmayı desteklemiyor.");
    return;
  }
  
  const targetInput = document.getElementById(targetId);
  const btn = document.getElementById('btnVoiceDict_' + targetId);
  if (!targetInput) return;

  if (window.activeDictation) {
    window.activeDictation.stop();
    window.activeDictation = null;
    if (btn) btn.style.color = "var(--text3)";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'tr-TR';
  recognition.interimResults = true;
  recognition.continuous = true;

  if (btn) {
    btn.style.color = "var(--danger)";
  }

  let finalTranscript = targetInput.value;
  if (finalTranscript && !finalTranscript.endsWith(' ')) {
    finalTranscript += ' ';
  }

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    targetInput.value = finalTranscript + interimTranscript;
    if (typeof updateReportPreview === 'function') updateReportPreview();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    window.activeDictation = null;
    if (btn) btn.style.color = "var(--text3)";
  };

  recognition.onend = () => {
    window.activeDictation = null;
    if (btn) btn.style.color = "var(--text3)";
  };

  recognition.start();
  window.activeDictation = recognition;
};

// ── Offline-first & Auto-save (Otomatik Taslak) ────────────────
window.saveDraft = function(formId) {
  if (formId === 'report') {
    const draft = {
      notes: document.getElementById('rep_notes')?.value || ''
    };
    localStorage.setItem('draft_report', JSON.stringify(draft));
  }
};

window.loadDraft = function(formId) {
  if (formId === 'report') {
    const draftData = localStorage.getItem('draft_report');
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        if (draft.notes) {
          const notesEl = document.getElementById('rep_notes');
          if (notesEl) {
            notesEl.value = draft.notes;
            if (typeof updateReportPreview === 'function') updateReportPreview();
          }
        }
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.loadDraft('report');
});

// ── Kanban / Sürükle Bırak ────────────────────────────────────
window.kanbanMode = false;

window.toggleKanban = function() {
  window.kanbanMode = !window.kanbanMode;
  const toggleText = document.getElementById('kanbanToggleText');
  if (toggleText) {
    toggleText.textContent = window.kanbanMode ? 'Liste Görünümü' : 'Kanban';
  }
  if (typeof render === 'function') render();
};

window.allowDrop = function(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add('drag-over');
};

window.dragLeave = function(ev) {
  ev.currentTarget.classList.remove('drag-over');
};

window.drag = function(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  ev.target.classList.add('dragging');
};

window.dragEnd = function(ev) {
  ev.target.classList.remove('dragging');
};

window.drop = async function(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.remove('drag-over');
  
  const data = ev.dataTransfer.getData("text");
  const el = document.getElementById(data);
  if (!el) return;
  
  const newStatus = ev.currentTarget.getAttribute('data-status');
  if (!newStatus) return;
  
  const idStr = data.replace('kanban-card-', '');
  
  // Find item and update locally
  const item = items.find(i => i.id === idStr);
  if (item) {
    item.durum = newStatus;
    // Update remote
    try {
      if (window.db) {
        import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(async (mod) => {
          const { doc, updateDoc } = mod;
          const ref = doc(window.db, "items", idStr);
          await updateDoc(ref, { durum: newStatus, lastEditedBy: (window.currentUser && window.currentUser.email) ? window.currentUser.email : 'system' });
        }).catch(err => {
          console.error("Kanban update remote failed", err);
          render();
        });
      }
    } catch(e) {
      console.error(e);
      render();
    }
    // Optimistic render
    render();
  }
};

window.toggleDesktopAccordion = function(event, id) {
  if (event) {
    event.stopPropagation();
    const target = event.target;
    // Do not toggle if clicked on buttons, links, inputs, selects, or editable cells
    if (target.closest('button, a, input, select, .editable-cell') || target.tagName === 'BUTTON') {
      return;
    }
  }
  const el = document.getElementById('desktop-accordion-' + id);
  if (el) {
    if (el.style.display === 'none') {
      el.style.display = 'table-row';
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'opacity 0.25s ease';
        el.style.opacity = '1';
      }, 10);
    } else {
      el.style.display = 'none';
    }
  }
};