// ── YSR Utilities & Helpers ─────────────────────────────────────

// Debounce helper function for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Shakes a DOM element for error animations
function shakeElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('shake-error');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('shake-error');
    setTimeout(() => el.classList.remove('shake-error'), 400);
  }
}

// Generates relative time formatting for 2026 UX
function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  const now = new Date();
  const diffInMs = date - now;
  const isFuture = diffInMs > 0;
  const absDiffMs = Math.abs(diffInMs);
  
  const diffInMins = Math.floor(absDiffMs / 60000);
  const diffInHours = Math.floor(absDiffMs / 3600000);
  const diffInDays = Math.floor(absDiffMs / 86400000);

  if (diffInMins < 1) return 'Az önce';
  if (isFuture) {
    if (diffInMins < 60) return `${diffInMins} dk sonra`;
    if (diffInHours < 24) return `${diffInHours} saat sonra`;
    if (diffInDays === 1) return 'Yarın';
    if (diffInDays < 7) return `${diffInDays} gün sonra`;
  } else {
    if (diffInMins < 60) return `${diffInMins} dk önce`;
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
  }
  return date.toLocaleDateString('tr-TR');
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeJS(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Expose functions globally
window.debounce = debounce;
window.shakeElement = shakeElement;
window.getRelativeTime = getRelativeTime;
window.escapeHTML = escapeHTML;
window.escapeJS = escapeJS;


// ── Firebase init ─────────────────────────────────────────────
let db, storage;
try {
  if (!window.FIREBASE_CONFIG) {
    throw new Error("window.FIREBASE_CONFIG global değişkeni tanımlı değil.");
  }
  firebase.initializeApp(window.FIREBASE_CONFIG);
  db = firebase.firestore();
  storage = firebase.storage();
  
  // Enable offline persistence for Firestore
  db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Multiple tabs open, Firestore offline persistence enabled only in first tab.");
      } else if (err.code === 'unimplemented') {
        console.warn("The current browser does not support all of the features required to enable Firestore persistence.");
      }
    });
} catch(e) {
  console.error("Firebase Initialization Error:", e);
  window.FIREBASE_INIT_ERROR = e.message;
}

// ── State ─────────────────────────────────────────────────────
let editIdx=-1, sortKey='ttar', sortDir='desc', editKesifId=null, convertingSurveyId=null, editUserId=null, editReportId=null;
let catChartInstance = null;
let statusChartInstance = null;
let mahalCategoryChartInstance = null;
let monthlyTrendChartInstance = null;
let conversionChartInstance = null;

const STAT_CLS=['b-0','b-1','b-2','b-3','b-4','b-5','b-hak','b-6'];
const STAT_NAMES=['Gönderilecek','Gönderildi','Onaylandı','Reddedildi','İş Yapım Aşamasında','Tamamlandı','Hakediş Onaylandı','Faturalandı'];
const CAT_CLS={İnşaat:'b-ins',Mekanik:'b-mek',Elektrik:'b-elk',Diğer:'b-diger'};
const today=()=>new Date().toISOString().split('T')[0];
const isOD=it=>it.bit&&it.bit<today()&&['Onaylandı','İş Yapım Aşamasında'].includes(it.durum);
const fmt=d=>{
  if(!d||d==='-')return'-';
  if(typeof d !== 'string') return String(d);
  const pts = d.split('-');
  if (pts.length < 3) return d;
  const[y,m,dd]=pts;
  return `${dd}.${m}.${y}`;
};
const fmtN=(n,c)=>(!n&&n!==0||n==='')?'-':`${Number(n).toLocaleString('tr-TR')}\u00A0${c||''}`;

// ── Firestore helpers ─────────────────────────────────────────
const col=name=>db.collection(name);

window.activeListeners = {};

function setupSnapshot(colName, orderByField, orderByDir, onUpdate) {
  return new Promise((resolve, reject) => {
    // Unsubscribe existing listener for this collection if active
    if (window.activeListeners && typeof window.activeListeners[colName] === 'function') {
      try { window.activeListeners[colName](); } catch(e){}
    }
    
    let query = col(colName);
    if (orderByField) query = query.orderBy(orderByField, orderByDir);
    let isFirst = true;
    
    const unsubscribe = query.onSnapshot(snap => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      onUpdate(data);
      if (isFirst) {
        isFirst = false;
        resolve();
      } else {
        // Trigger UI updates safely using debounced functions to prevent thrashes
        if (typeof debouncedRender === 'function') {
          try { debouncedRender(); } catch(e){}
        }
        if (typeof updateStats === 'function') {
          try { updateStats(); } catch(e){}
        }
        if (typeof checkOverdue === 'function') {
          try { checkOverdue(); } catch(e){}
        }
        if (typeof populateMahalFilter === 'function') {
           try { populateMahalFilter(); } catch(e){}
        }
        if (typeof renderMahalPanel === 'function') {
           try { renderMahalPanel(); } catch(e){}
        }
        if (typeof populateModalMahal === 'function') {
           try { populateModalMahal(); } catch(e){}
        }
        if (typeof debouncedRenderKesif === 'function') {
           try { debouncedRenderKesif(); } catch(e){}
        }
        if (typeof debouncedRenderReports === 'function') {
           try { debouncedRenderReports(); } catch(e){}
        }
        if (typeof debouncedRenderTaseron === 'function') {
           try { debouncedRenderTaseron(); } catch(e){}
        }
        if (typeof renderCharts === 'function') {
            try { 
              const analizPage = document.getElementById('page_analiz');
              if(analizPage && analizPage.classList.contains('active')) renderCharts();
            } catch(e){}
        }
      }
    }, err => {
      console.error(colName, "snapshot error:", err);
      if (isFirst) reject(err);
    });
    
    if (window.activeListeners) {
      window.activeListeners[colName] = unsubscribe;
    }
  });
}

async function loadAll(){
  try {
    await Promise.all([
      setupSnapshot('mahals', 'name', 'asc', d => { mahals = d; }),
      setupSnapshot('items', 'createdAt', 'desc', d => { items = d; }),
      setupSnapshot('surveys', null, null, d => { surveys = d; }),
      setupSnapshot('reports', null, null, d => { reports = d; }),
      setupSnapshot('taseronlar', null, null, d => { taseronlar = d; }),
      setupSnapshot('taseron_payments', 'date', 'desc', d => { taseron_payments = d; })
    ]);
    
    // Check and seed default users if empty
    const usersSnap = await col('users').limit(1).get();
    if (usersSnap.empty) {
      const passAdmin = await sha256('ysr2024');
      const passUser = await sha256('ysr123');
      await col('users').add({u:'admin',p:passAdmin,r:'admin',status:'offline'});
      await col('users').add({u:'ysr',p:passUser,r:'user',status:'offline'});
    }
  } catch (e) {
    console.error("loadAll error:", e);
    throw e;
  }
}

// ── SHA-256 Hashing for Secure Passwords ──────────────────────
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Custom Alert & Confirm Systems ────────────────────────────
function showToast(message, type = 'success') {
  if (document.body.classList.contains('calm-ui') && type !== 'error') {
    window.calmToastQueue = window.calmToastQueue || [];
    window.calmToastQueue.push({ message, type });
    updateCalmBadge();
    return;
  }

  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  } else {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
  
  toast.innerHTML = `<span style="display:inline-flex; align-items:center;">${icon}</span><span style="flex:1; margin-left:6px;">${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showConfirm(title, message, isDangerous = false) {
  return new Promise((resolve) => {
    const bg = document.getElementById('confirmBg');
    const tEl = document.getElementById('confirmTitle');
    const mEl = document.getElementById('confirmMsg');
    const btnOk = document.getElementById('btnConfirmOk');
    const btnCancel = document.getElementById('btnConfirmCancel');
    
    tEl.textContent = title;
    mEl.textContent = message;
    
    if (isDangerous) {
      btnOk.style.background = 'var(--red)';
      btnOk.textContent = 'Sil';
    } else {
      btnOk.style.background = 'var(--primary)';
      btnOk.textContent = 'Tamam';
    }
    
    bg.classList.add('open');
    
    const cleanUp = (value) => {
      bg.classList.remove('open');
      btnOk.onclick = null;
      btnCancel.onclick = null;
      resolve(value);
    };
    
    btnOk.onclick = () => cleanUp(true);
    btnCancel.onclick = () => cleanUp(false);
    bg.onclick = (e) => { if (e.target === bg) cleanUp(false); };
  });
}

function showPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    const bg = document.getElementById('promptBg');
    const tEl = document.getElementById('promptTitle');
    const input = document.getElementById('promptInput');
    const btnOk = document.getElementById('btnPromptOk');
    const btnCancel = document.getElementById('btnPromptCancel');
    
    tEl.textContent = title;
    input.value = defaultValue;
    
    bg.classList.add('open');
    setTimeout(() => input.focus(), 100);
    
    const keyHandler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cleanUp(input.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cleanUp(null);
      }
    };
    
    input.addEventListener('keydown', keyHandler);
    
    const cleanUp = (value) => {
      bg.classList.remove('open');
      input.removeEventListener('keydown', keyHandler);
      btnOk.onclick = null;
      btnCancel.onclick = null;
      resolve(value);
    };
    
    btnOk.onclick = () => cleanUp(input.value);
    btnCancel.onclick = () => cleanUp(null);
    bg.onclick = (e) => { if (e.target === bg) cleanUp(null); };
  });
}

function updateCalmBadge() {
  const btn = document.getElementById('calmToggleBtn');
  if (!btn) return;
  const count = window.calmToastQueue ? window.calmToastQueue.length : 0;
  let badge = document.getElementById('calmBadge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'calmBadge';
      badge.style.position = 'absolute';
      badge.style.top = '-2px';
      badge.style.right = '-2px';
      badge.style.background = 'var(--primary)';
      badge.style.color = '#ffffff';
      badge.style.borderRadius = '50%';
      badge.style.width = '16px';
      badge.style.height = '16px';
      badge.style.fontSize = '9px';
      badge.style.fontWeight = '700';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      btn.style.position = 'relative';
      btn.appendChild(badge);
    }
    badge.textContent = count;
  } else {
    if (badge) badge.remove();
  }
}

function unsubscribeAll() {
  if (window.activeListeners) {
    Object.keys(window.activeListeners).forEach(key => {
      if (typeof window.activeListeners[key] === 'function') {
        try {
          window.activeListeners[key]();
        } catch (e) {
          console.error(`Error unsubscribing from ${key}:`, e);
        }
        delete window.activeListeners[key];
      }
    });
  }
}
window.unsubscribeAll = unsubscribeAll;

// ── YSR Store - State Management ───────────────────────────────
const YSRStore = {
  _state: {
    items: [],
    mahals: [],
    users: [],
    logs: [],
    surveys: [],
    reports: [],
    taseronlar: [],
    taseron_payments: [],
    currentUser: null
  },
  
  _isSilent: false,

  init() {
    this._state.items = this._wrapArray([], 'items');
    this._state.mahals = this._wrapArray([], 'mahals');
    this._state.users = this._wrapArray([], 'users');
    this._state.logs = this._wrapArray([], 'logs');
    this._state.surveys = this._wrapArray([], 'surveys');
    this._state.reports = this._wrapArray([], 'reports');
    this._state.taseronlar = this._wrapArray([], 'taseronlar');
    this._state.taseron_payments = this._wrapArray([], 'taseron_payments');
  },
  
  _wrapArray(arr, key) {
    return new Proxy(arr, {
      get: (target, prop, receiver) => {
        if (['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop)) {
          return (...args) => {
            const result = target[prop].apply(target, args);
            this.triggerUpdate(key);
            return result;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        const res = Reflect.set(target, prop, value, receiver);
        if (!this._isSilent && (prop === 'length' || !isNaN(Number(prop)))) {
          this.triggerUpdate(key);
        }
        return res;
      }
    });
  },

  get items() { return this._state.items; },
  set items(val) { 
    this._state.items = this._wrapArray(val || [], 'items'); 
    this.triggerUpdate('items'); 
  },

  get mahals() { return this._state.mahals; },
  set mahals(val) { 
    this._state.mahals = this._wrapArray(val || [], 'mahals'); 
    this.triggerUpdate('mahals'); 
  },

  get users() { return this._state.users; },
  set users(val) { 
    this._state.users = this._wrapArray(val || [], 'users'); 
    this.triggerUpdate('users'); 
  },

  get logs() { return this._state.logs; },
  set logs(val) { 
    this._state.logs = this._wrapArray(val || [], 'logs'); 
    this.triggerUpdate('logs'); 
  },

  get surveys() { return this._state.surveys; },
  set surveys(val) { 
    this._state.surveys = this._wrapArray(val || [], 'surveys'); 
    this.triggerUpdate('surveys'); 
  },

  get reports() { return this._state.reports; },
  set reports(val) { 
    this._state.reports = this._wrapArray(val || [], 'reports'); 
    this.triggerUpdate('reports'); 
  },

  get taseronlar() { return this._state.taseronlar; },
  set taseronlar(val) {
    this._state.taseronlar = this._wrapArray(val || [], 'taseronlar');
    this.triggerUpdate('taseronlar');
  },

  get taseron_payments() { return this._state.taseron_payments; },
  set taseron_payments(val) {
    this._state.taseron_payments = this._wrapArray(val || [], 'taseron_payments');
    this.triggerUpdate('taseron_payments');
  },

  get currentUser() { return this._state.currentUser; },
  set currentUser(val) { this._state.currentUser = val; },

  triggerUpdate(type) {
    if (this._isSilent) return;
    
    // Dispatch an event so other components can react
    window.dispatchEvent(new CustomEvent(`ysr:${type}-changed`, { detail: this._state[type] }));
    
    // Debounced rendering functions check
    if (type === 'items' && typeof debouncedRender === 'function') debouncedRender();
    if (type === 'surveys' && typeof debouncedRenderKesif === 'function') debouncedRenderKesif();
    if (type === 'reports' && typeof debouncedRenderReports === 'function') debouncedRenderReports();
    if (type === 'taseronlar' && typeof debouncedRenderTaseron === 'function') debouncedRenderTaseron();
    if (type === 'taseron_payments' && typeof debouncedRenderTaseron === 'function') debouncedRenderTaseron();
  }
};

// Initialize the store
YSRStore.init();

// Expose state as global getters/setters on the window object for 100% backward compatibility
['items', 'mahals', 'users', 'logs', 'surveys', 'reports', 'taseronlar', 'taseron_payments', 'currentUser'].forEach(key => {
  Object.defineProperty(window, key, {
    get() { return YSRStore[key]; },
    set(val) { YSRStore[key] = val; },
    configurable: true
  });
});


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
const debouncedRenderTaseron = debounce(() => { if(typeof renderTaseron === 'function') renderTaseron(); }, 300);
window.debouncedRender = debouncedRender;
window.debouncedRenderKesif = debouncedRenderKesif;
window.debouncedRenderReports = debouncedRenderReports;
window.debouncedRenderTaseron = debouncedRenderTaseron;

// Dynamic Radial-Gradient Card Reflection Glow Tracking (Optimized with delegated mouseover/mousemove)
let activeGlowCard = null;
let isTickingMouse = false;

document.addEventListener('mouseover', e => {
  if (window.energyMode === 'enabled') return;
  const card = e.target.closest('.stat-card, .chart-card, .panel-card');
  if (card) {
    activeGlowCard = card;
  }
});

document.addEventListener('mouseout', e => {
  const card = e.target.closest('.stat-card, .chart-card, .panel-card');
  if (card && activeGlowCard === card) {
    activeGlowCard = null;
  }
});

document.addEventListener('mousemove', e => {
  if (!activeGlowCard || window.energyMode === 'enabled') return;
  if (!isTickingMouse) {
    window.requestAnimationFrame(() => {
      if (activeGlowCard) {
        const rect = activeGlowCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        activeGlowCard.style.setProperty('--mouse-x', `${x}px`);
        activeGlowCard.style.setProperty('--mouse-y', `${y}px`);
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
  html+=`<div class="tab" id="t_taseronlar" role="tab" tabindex="0" aria-selected="false" onclick="showTab('taseronlar')">Taşeronlar</div>`;
  html+=`<div class="tab" id="t_akilli_moduller" role="tab" tabindex="0" aria-selected="false" onclick="showTab('akilli_moduller')">Akıllı Modüller</div>`;
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

  // Mobil alt menü (Bottom Navigation) - 5 Buton Sınırı ile
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
  mHtml+=`<button class="mobile-nav-item" id="mn_menu" onclick="toggleMobileMenu()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    <span>Menü</span>
  </button>`;
  const mNav = document.getElementById('mobileNav');
  if(mNav) mNav.innerHTML = mHtml;

  // Mobil Bottom Sheet Menüsünü oluştur
  buildMobileMenuSheet();

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
  stHtml+=`<button class="scrolled-tab-item" id="st_taseronlar" onclick="showTab('taseronlar')" data-tooltip="Taşeronlar">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_hesap" onclick="showTab('hesap')" data-tooltip="Profil">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  </button>`;
  stHtml+=`<button class="scrolled-tab-item" id="st_logs" onclick="showTab('logs')" data-tooltip="Geçmiş">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  </button>`;
  if(currentUser.r==='admin') {
    stHtml+=`<button class="scrolled-tab-item" id="st_admin" onclick="showTab('admin')" data-tooltip="Kullanıcılar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
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
  if(mEl) {
    mEl.classList.add('active');
  } else {
    // Eğer seçilen sekme alt barda yoksa (örn: İşverenler, Taşeronlar vb.), Menü butonunu aktif et
    const menuBtn = document.getElementById('mn_menu');
    if (menuBtn) menuBtn.classList.add('active');
  }

  // Menü içindeki elemanların aktiflik durumunu güncelle
  document.querySelectorAll('.menu-sheet-item').forEach(b => {
    b.classList.remove('active');
    b.style.borderColor = 'var(--border)';
    b.style.background = 'var(--bg2)';
  });
  const sheetEl = document.getElementById('msi_' + t);
  if (sheetEl) {
    sheetEl.classList.add('active');
    sheetEl.style.borderColor = 'var(--primary)';
    sheetEl.style.background = 'rgba(var(--primary-rgb), 0.05)';
  }
  
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
  if(t==='taseronlar' && typeof renderTaseron === 'function') renderTaseron();
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
let activeCmdIndex = -1;

window.openCmdPalette = function() {
  const palette = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdSearchInput');
  activeCmdIndex = -1;
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
  const palette = document.getElementById('cmdPalette');
  const isPaletteOpen = palette && palette.style.display === 'flex';
  
  if (e.key === 'Escape') {
    if (isPaletteOpen) {
      closeCmdPalette();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdPalette();
  } else if (isPaletteOpen) {
    const visibleItems = Array.from(document.querySelectorAll('.cmd-item')).filter(x => x.style.display !== 'none');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (visibleItems.length === 0) return;
      visibleItems.forEach(x => x.classList.remove('selected'));
      activeCmdIndex = (activeCmdIndex + 1) % visibleItems.length;
      visibleItems[activeCmdIndex].classList.add('selected');
      visibleItems[activeCmdIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (visibleItems.length === 0) return;
      visibleItems.forEach(x => x.classList.remove('selected'));
      activeCmdIndex = (activeCmdIndex - 1 + visibleItems.length) % visibleItems.length;
      visibleItems[activeCmdIndex].classList.add('selected');
      visibleItems[activeCmdIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (activeCmdIndex >= 0 && activeCmdIndex < visibleItems.length) {
        e.preventDefault();
        visibleItems[activeCmdIndex].click();
      }
    }
  }
});

window.handleCmdSearch = function(val) {
  const items = document.querySelectorAll('.cmd-item');
  const term = val.toLowerCase();
  items.forEach(item => {
    item.classList.remove('selected');
    const text = item.querySelector('.cmd-text').textContent.toLowerCase();
    if (text.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  activeCmdIndex = -1;
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

window.toggleFilterBarOptions = function() {
  const row = document.getElementById('filterSubRow');
  const btn = document.getElementById('btnToggleFilters');
  if (!row || !btn) return;
  if (row.style.display === 'none' || row.style.display === '') {
    row.style.display = 'flex';
    btn.classList.add('active');
  } else {
    row.style.display = 'none';
    btn.classList.remove('active');
  }
};

/* ============================================================
   MOBİL MENÜ YARDIMCI FONKSİYONLARI
   ============================================================ */
window.buildMobileMenuSheet = function() {
  let sheet = document.getElementById('mobileMenuSheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'mobileMenuSheet';
    sheet.className = 'mobile-menu-sheet';
    document.body.appendChild(sheet);
  }

  let adminItem = '';
  if (window.currentUser && window.currentUser.r === 'admin') {
    adminItem = `
      <div class="menu-sheet-item" id="msi_admin" onclick="handleMobileMenuClick('admin')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
        <span>Kullanıcılar</span>
      </div>
    `;
  }

  sheet.innerHTML = `
    <div class="menu-sheet-backdrop" onclick="toggleMobileMenu()"></div>
    <div class="menu-sheet-content">
      <div class="menu-sheet-header">
        <h3>Menü</h3>
        <button class="menu-sheet-close" onclick="toggleMobileMenu()">&times;</button>
      </div>
      <div class="menu-sheet-grid">
        <div class="menu-sheet-item" id="msi_mahal" onclick="handleMobileMenuClick('mahal')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>İşverenler</span>
        </div>
        <div class="menu-sheet-item" id="msi_taseronlar" onclick="handleMobileMenuClick('taseronlar')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Taşeronlar</span>
        </div>
        <div class="menu-sheet-item" id="msi_akilli_moduller" onclick="handleMobileMenuClick('akilli_moduller')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          <span>Akıllı Modüller</span>
        </div>
        <div class="menu-sheet-item" id="msi_hesap" onclick="handleMobileMenuClick('hesap')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Profilim</span>
        </div>
        <div class="menu-sheet-item" id="msi_logs" onclick="handleMobileMenuClick('logs')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>İşlem Geçmişi</span>
        </div>
        ${adminItem}
        <div class="menu-sheet-item logout" onclick="handleMobileLogout()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Çıkış Yap</span>
        </div>
      </div>
    </div>
  `;
};

window.toggleMobileMenu = function() {
  const sheet = document.getElementById('mobileMenuSheet');
  if (sheet) {
    sheet.classList.toggle('active');
    
    const menuBtn = document.getElementById('mn_menu');
    if (menuBtn) {
      if (sheet.classList.contains('active')) {
        menuBtn.classList.add('active');
      } else {
        // If we are currently active on a tab inside the menu, keep Menü button highlighted
        const activeSubPage = Array.from(document.querySelectorAll('.menu-sheet-item')).some(item => {
          return item.classList.contains('active');
        });
        if (!activeSubPage) {
          menuBtn.classList.remove('active');
        }
      }
    }
  }
};

window.handleMobileMenuClick = function(tabName) {
  window.toggleMobileMenu();
  window.showTab(tabName);
};

window.handleMobileLogout = function() {
  window.toggleMobileMenu();
  window.doLogout();
};

// ── Auth ──────────────────────────────────────────────────────
async function doLogin(){
  const u=document.getElementById('li_u').value.trim();
  const p=document.getElementById('li_p').value;
  const loginErr = document.getElementById('loginErr');
  const btn = document.querySelector('.login-btn');
  
  if(!u||!p){loginErr.textContent='Kullanıcı adı ve şifre gerekli';return;}
  
  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-loader"></span> Giriş Yapılıyor...';
  loginErr.textContent = '';
  
  if (!window.FIREBASE_CONFIG || !db || !storage) {
    const detail = window.FIREBASE_INIT_ERROR || "Firebase kütüphanesi veya depolama alanı başlatılamadı. SDK yükleme veya erişim kısıtlaması olabilir.";
    setTimeout(() => {
      loginErr.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px; color:var(--red); font-weight:600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Bağlantı Başarısız!</span><br><span style="font-size:11px; font-weight:500; color:var(--text2)">Hata Detayı: ${detail}</span>`;
      btn.disabled = false;
      btn.innerHTML = originalText;
    }, 600);
    return;
  }
  
  try{
    const hashedP = await sha256(p);
    
    // Secure query: check database directly for username matching lowercase entered input
    const userQuery = await col('users').where('u', '==', u.toLowerCase()).get();
    let found = null;
    userQuery.forEach(doc => {
      const data = doc.data();
      if (data.p === p || data.p === hashedP) {
        found = { id: doc.id, ...data };
      }
    });
    
    if(!found){
      loginErr.textContent='Kullanıcı adı veya şifre hatalı';
      btn.disabled = false;
      btn.innerHTML = originalText;
      const card = document.querySelector('.login-card-outer');
      if (card) {
        card.classList.add('shake-error');
        setTimeout(() => card.classList.remove('shake-error'), 400);
      }
      return;
    }
    
    currentUser=found;
    loginErr.textContent='';
    
    // Subscribe to users collection only if user has admin role
    if (currentUser.r === 'admin') {
      await setupSnapshot('users', null, null, d => { users = d; });
    }
    
    // Load all other data ONLY after successful validation
    await loadAll();
    
    // Save session to localStorage for auto login on refresh
    localStorage.setItem('ysr_session', JSON.stringify({ u: found.u, p: hashedP }));
    
    // Smooth transition from login to app dashboard
    const loginScr = document.getElementById('loginScreen');
    const appScr = document.getElementById('appScreen');
    
    loginScr.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    loginScr.style.opacity = '0';
    loginScr.style.transform = 'scale(0.95)';
    loginScr.style.filter = 'blur(15px)';
    
    setTimeout(() => {
      loginScr.style.display = 'none';
      
      appScr.style.display = 'flex';
      appScr.style.opacity = '0';
      appScr.style.transform = 'scale(1.05)';
      appScr.style.filter = 'blur(10px)';
      appScr.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      
      // Force reflow
      appScr.offsetHeight;
      
      appScr.style.opacity = '1';
      appScr.style.transform = 'scale(1)';
      appScr.style.filter = 'blur(0)';
      
      setTimeout(() => {
        appScr.style.transform = '';
        appScr.style.filter = '';
      }, 850);
      
      document.getElementById('topbarUser').textContent=currentUser.u+(currentUser.r==='admin'?' · Admin':'');
      buildTabs();populateMahalFilter();render();updateSortHeadersUI();updateStats();checkOverdue();loadProfile();
      startPresenceHeartbeat();
    }, 600);
  }catch(e){
    loginErr.textContent='Bağlantı hatası: '+e.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
async function doLogout(){
  if (currentUser && currentUser.id) {
    await updateUserPresence('offline');
  }
  stopPresenceHeartbeat();
  if (typeof unsubscribeAll === 'function') unsubscribeAll();
  currentUser=null;items=[];mahals=[];users=[];
  localStorage.removeItem('ysr_session'); // Clear session
  const loginScr = document.getElementById('loginScreen');
  const appScr = document.getElementById('appScreen');
  
  appScr.style.transition = 'opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease';
  appScr.style.opacity = '0';
  appScr.style.transform = 'scale(0.95)';
  appScr.style.filter = 'blur(10px)';
  
  setTimeout(() => {
    appScr.style.display = 'none';
    
    loginScr.style.display = 'flex';
    loginScr.style.opacity = '0';
    loginScr.style.transform = 'scale(1.05)';
    loginScr.style.filter = 'blur(10px)';
    loginScr.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    
    loginScr.offsetHeight;
    
    loginScr.style.opacity = '1';
    loginScr.style.transform = 'scale(1)';
    loginScr.style.filter = 'blur(0)';
    
    document.getElementById('li_u').value='';document.getElementById('li_p').value='';
  }, 500);
}

// ── Profil Yönetimi ───────────────────────────────────────────
async function manualSaveProfile() {
  saveProfile();
  
  if (currentUser && currentUser.id) {
    try {
      const updates = {
        name: document.getElementById('prof_name').value.trim(),
        job: document.getElementById('prof_job').value.trim(),
        bio: document.getElementById('prof_bio').value.trim(),
        accent: document.getElementById('prof_accent').value
      };
      await col('users').doc(currentUser.id).update(updates);
      
      // Update local currentUser state
      Object.assign(currentUser, updates);
      
      // Load users collection only if current user is admin
      if (currentUser.r === 'admin') {
        const snap = await col('users').get();
        users = snap.docs.map(d=>({id:d.id,...d.data()}));
        if(document.getElementById('page_admin').classList.contains('active')) renderAdminPanel();
      }
      render();
    } catch(e) {
      console.error("Firebase user profile sync failed", e);
    }
  }

  const msg = document.getElementById('saveProfileMsg');
  if(msg) {
    msg.style.display = 'inline-block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
  }
  showToast('Profil başarıyla kaydedildi.');
}

function saveProfile() {
  if (!currentUser) return;
  const profile = {
    name: document.getElementById('prof_name').value.trim(),
    job: document.getElementById('prof_job').value.trim(),
    bio: document.getElementById('prof_bio').value.trim(),
    accent: document.getElementById('prof_accent').value
  };
  localStorage.setItem('profile_' + currentUser.u, JSON.stringify(profile));
  updateProfileUI();
}

function loadProfile() {
  if (!currentUser) return;
  const raw = localStorage.getItem('profile_' + currentUser.u);
  if (raw) {
    const profile = JSON.parse(raw);
    document.getElementById('prof_name').value = profile.name || '';
    document.getElementById('prof_job').value = profile.job || '';
    document.getElementById('prof_bio').value = profile.bio || '';
    document.getElementById('prof_accent').value = profile.accent || 'indigo';
    changeAccentColor(profile.accent || 'indigo', true);
  } else {
    document.getElementById('prof_name').value = currentUser.u === 'admin' ? 'YSR Admin' : 'YSR Kullanıcı';
    document.getElementById('prof_job').value = currentUser.r === 'admin' ? 'Genel Yönetici' : 'İnşaat Mühendisi';
    document.getElementById('prof_bio').value = 'Proje ve tekliflerin genel koordinasyonu';
    document.getElementById('prof_accent').value = 'indigo';
    changeAccentColor('indigo', true);
    saveProfile();
  }
  updateProfileUI();
}

function updateProfileUI() {
  if (!currentUser) return;
  const name = document.getElementById('prof_name').value || currentUser.u;
  const job = document.getElementById('prof_job').value || (currentUser.r === 'admin' ? 'Admin' : 'Kullanıcı');
  
  document.getElementById('profNameTitle').textContent = name;
  document.getElementById('profRoleTitle').textContent = job;
  
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
  document.getElementById('profAvatar').textContent = initials || currentUser.u[0];
}

function changeAccentColor(color, isInit = false) {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme') || 'light';
  
  const colors = {
    indigo: {
      light: { primary: '#4f46e5', hover: '#4338ca', bg: '#f5f3ff', faded: 'rgba(79, 70, 229, 0.05)' },
      dark: { primary: '#6366f1', hover: '#4f46e5', bg: 'rgba(99, 102, 241, 0.08)', faded: 'rgba(99, 102, 241, 0.04)' }
    },
    blue: {
      light: { primary: '#2563eb', hover: '#1d4ed8', bg: '#eff6ff', faded: 'rgba(37, 99, 235, 0.05)' },
      dark: { primary: '#3b82f6', hover: '#2563eb', bg: 'rgba(59, 130, 246, 0.08)', faded: 'rgba(59, 130, 246, 0.04)' }
    },
    emerald: {
      light: { primary: '#059669', hover: '#047857', bg: '#ecfdf5', faded: 'rgba(5, 150, 105, 0.05)' },
      dark: { primary: '#10b981', hover: '#059669', bg: 'rgba(16, 185, 129, 0.08)', faded: 'rgba(16, 185, 129, 0.04)' }
    },
    amber: {
      light: { primary: '#d97706', hover: '#b45309', bg: '#fffbeb', faded: 'rgba(217, 119, 6, 0.05)' },
      dark: { primary: '#f59e0b', hover: '#d97706', bg: 'rgba(245, 158, 11, 0.08)', faded: 'rgba(245, 158, 11, 0.04)' }
    }
  };
  
  const active = colors[color] || colors.indigo;
  const set = theme === 'dark' ? active.dark : active.light;
  
  root.style.setProperty('--primary', set.primary);
  root.style.setProperty('--primary-hover', set.hover);
  root.style.setProperty('--primary-bg', set.bg);
  root.style.setProperty('--primary-color-faded', set.faded);
  
  if (!isInit) {
    saveProfile();
  }
}

let presenceInterval = null;

async function updateUserPresence(status = 'online') {
  if (!currentUser || !currentUser.id) return;
  try {
    await col('users').doc(currentUser.id).update({
      status: status,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Firebase presence sync failed", e);
  }
}

function startPresenceHeartbeat() {
  stopPresenceHeartbeat();
  updateUserPresence('online');
  presenceInterval = setInterval(() => {
    if (navigator.onLine) {
      updateUserPresence('online');
    }
  }, 60000);
}

function stopPresenceHeartbeat() {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
}

window.addEventListener('beforeunload', () => {
  if (currentUser && currentUser.id) {
    try {
      col('users').doc(currentUser.id).update({
        status: 'offline'
      }).catch(err => console.error("beforeunload presence error:", err));
    } catch (e) {
      console.error("beforeunload exception:", e);
    }
  }
});

window.togglePasswordVisibility = function() {
  const pInput = document.getElementById('li_p');
  const btn = document.getElementById('togglePasswordBtn');
  if (!pInput || !btn) return;
  if (pInput.type === 'password') {
    pInput.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    btn.setAttribute('aria-label', 'Şifreyi Gizle');
  } else {
    pInput.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    btn.setAttribute('aria-label', 'Şifreyi Göster');
  }
};

// ── Keşifler (Site Surveys) ───────────────────────────────────
function renderKesif(){
  const q=(document.getElementById('srchKesif').value||'').toLowerCase();
  const cat=document.getElementById('fCatKesif').value;
  const stat=document.getElementById('fStatKesif').value;
  
  const f=surveys.filter(it=>{
    const nameVal = it.santiye || it.otel || '';
    if(q&&!nameVal.toLowerCase().includes(q)&&!getMahalName(it.mahalId).toLowerCase().includes(q))return false;
    if(cat&&it.kat!==cat)return false;
    if(stat&&it.durum!==stat)return false;
    return true;
  });

  const tb=document.getElementById('kesifTbody');
  const mobList=document.getElementById('mobileKesifWrap');

  if(!f.length){
    const emptyStateHtml = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding: 40px 20px; text-align: center;">
        <svg class="empty-state-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px;">Keşif Bulunmamaktadır</div>
          <div style="font-size: 12px; color: var(--text2);">Aradığınız kriterlere uygun keşif bulunamadı.</div>
        </div>
      </div>`;
    tb.innerHTML=`<tr class="empty-row"><td colspan="9" style="padding: 60px 20px; text-align: center; background:transparent;">${emptyStateHtml}</td></tr>`;
    if(mobList) mobList.innerHTML = emptyStateHtml;
    return;
  }

  tb.innerHTML=f.map((it,i)=>{
    const statusClass = it.durum === 'Teklife Dönüştü' ? 'b-2' : (it.durum === 'Keşif Yapıldı' ? 'b-4' : 'b-0');
    const convertBtn = it.durum !== 'Teklife Dönüştü' ? `<button class="btn-quick" style="background:var(--primary); color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer; font-weight:600; font-size:12px;" onclick="convertToProposal('${it.id}')">Teklife Dönüştür</button>` : '';
    return `<tr>
      <td style="color:var(--text2);font-weight:600">${i+1}</td>
      <td><span class="mahal-tag">${escapeHTML(getMahalName(it.mahalId))}</span></td>
      <td style="font-weight:700; max-width:220px; white-space:normal; line-height:1.3;">${escapeHTML(it.santiye || it.otel || '-')}</td>
      <td><span class="badge ${CAT_CLS[it.kat]||'b-diger'}">${escapeHTML(it.kat||'-')}</span></td>
      <td>${escapeHTML(fmt(it.ktar))}</td>
      <td style="font-weight:600;">${escapeHTML(it.sorumlu||'-')}</td>
      <td><span class="badge ${statusClass}">${escapeHTML(it.durum||'-')}</span></td>
      <td style="max-width:200px; white-space:normal; font-size:12px; color:var(--text2);">${escapeHTML(it.notlar||'-')}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          ${convertBtn}
          <button class="btn-edit" style="padding:6px 8px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center;" onclick="openKesifModal('${it.id}')" aria-label="Düzenle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
          <button class="btn-del" style="padding:6px 8px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center;" onclick="delKesif('${it.id}')" aria-label="Sil"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  if(mobList){
    mobList.innerHTML=f.map((it,i)=>{
      const statusClass = it.durum === 'Teklife Dönüştü' ? 'b-2' : (it.durum === 'Keşif Yapıldı' ? 'b-4' : 'b-0');
      const convertBtn = it.durum !== 'Teklife Dönüştü' ? `<button class="btn-quick" style="background:var(--primary); color:#fff; border:none; border-radius:6px; padding:8px 12px; font-size:11px; font-weight:600; width:100%; margin-top:8px;" onclick="convertToProposal('${it.id}')">Teklife Dönüştür</button>` : '';
      return `<div class="mobile-card">
        <div class="mobile-card-header">
          <div>
            <div class="mobile-card-title">${escapeHTML(it.santiye || it.otel || '-')}</div>
            <div class="mobile-card-tags" style="margin-top:6px;">
              <span class="mahal-tag">${escapeHTML(getMahalName(it.mahalId))}</span>
              <span class="badge ${CAT_CLS[it.kat]||'b-diger'}">${escapeHTML(it.kat||'-')}</span>
            </div>
          </div>
          <span class="badge ${statusClass}" style="font-size:11px; padding:4px 8px;">${escapeHTML(it.durum||'-')}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; border-bottom: 1px dashed var(--border); padding-bottom:10px; margin-bottom:10px;">
          <div><span style="color:var(--text2)">Keşif Tarihi:</span> ${escapeHTML(fmt(it.ktar))}</div>
          <div><span style="color:var(--text2)">Sorumlu Mühendis:</span> ${escapeHTML(it.sorumlu||'-')}</div>
          <div style="margin-top:4px; color:var(--text2); font-style:italic;">${escapeHTML(it.notlar||'-')}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:6px; width: 100%;">
            <button class="btn-edit" style="padding:6px 10px; flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openKesifModal('${it.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Düzenle</button>
            <button class="btn-del" style="padding:6px 10px; flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="delKesif('${it.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Sil</button>
          </div>
        </div>
        ${convertBtn}
      </div>`;
    }).join('');
  }
  renderTodoList();
}

let editTodoId = null;
let editTodoSurveyId = null;

function getUserSelectOptions(selectedU) {
  let options = '<option value="">— Mühendis Seçilmedi —</option>';
  const sortedUsers = [...(window.users || [])].sort((a,b) => (a.u || '').localeCompare(b.u || ''));
  sortedUsers.forEach(usr => {
    const displayName = usr.name ? `${usr.name} (${usr.u})` : usr.u;
    options += `<option value="${usr.u}" ${usr.u === selectedU ? 'selected' : ''}>${escapeHTML(displayName)}</option>`;
  });
  return options;
}

function getTaseronSelectOptions(selectedId) {
  let options = '<option value="">— Taşeron Seçilmedi —</option>';
  const sortedTaserons = [...(window.taseronlar || [])].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  sortedTaserons.forEach(t => {
    options += `<option value="${t.id}" ${t.id === selectedId ? 'selected' : ''}>${escapeHTML(t.name)} (${escapeHTML(t.branch || '')})</option>`;
  });
  return options;
}

function getSurveySelectOptions(selectedValue) {
  let options = '<option value="">— Keşif veya Teklif Seçin —</option>';
  
  // 1. Keşifler (Surveys)
  const sortedSurveys = [...(window.surveys || [])].sort((a,b) => {
    const nameA = a.santiye || a.otel || '';
    const nameB = b.santiye || b.otel || '';
    return nameA.localeCompare(nameB, 'tr');
  });
  if (sortedSurveys.length > 0) {
    options += '<optgroup label="Keşifler (Site Surveys)">';
    sortedSurveys.forEach(s => {
      const val = `survey_${s.id}`;
      const label = `${escapeHTML(s.santiye || s.otel || '-')} (${escapeHTML(getMahalName(s.mahalId))})`;
      options += `<option value="${val}" ${val === selectedValue ? 'selected' : ''}>${label}</option>`;
    });
    options += '</optgroup>';
  }
  
  // 2. Teklifler (Proposals)
  const sortedItems = [...(window.items || [])].sort((a,b) => {
    const nameA = a.otel || a.santiye || a.aciklama || '';
    const nameB = b.otel || b.santiye || b.aciklama || '';
    return nameA.localeCompare(nameB, 'tr');
  });
  if (sortedItems.length > 0) {
    options += '<optgroup label="Teklifler (Proposals)">';
    sortedItems.forEach(p => {
      const val = `proposal_${p.id}`;
      const label = `${escapeHTML(p.otel || p.santiye || p.aciklama || '-')} (${escapeHTML(getMahalName(p.mahalId))})`;
      options += `<option value="${val}" ${val === selectedValue ? 'selected' : ''}>${label}</option>`;
    });
    options += '</optgroup>';
  }
  
  return options;
}

function renderTodoList() {
  const tbody = document.getElementById('todoListTbody');
  const mobList = document.getElementById('mobileTodoListWrap');
  const filterTaseronEl = document.getElementById('fTaseronTodo');
  if (!tbody) return;

  // Refresh subcontractor dropdown filter if open
  if (filterTaseronEl && filterTaseronEl.options.length <= 1) {
    const currentFilterVal = filterTaseronEl.value;
    let optHtml = '<option value="">Tüm Taşeronlar</option>';
    const sortedTaserons = [...(window.taseronlar || [])].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
    sortedTaserons.forEach(t => {
      optHtml += `<option value="${t.id}" ${t.id === currentFilterVal ? 'selected' : ''}>${escapeHTML(t.name)}</option>`;
    });
    filterTaseronEl.innerHTML = optHtml;
  }

  const q = (document.getElementById('srchTodo').value || '').toLowerCase();
  const fTaseron = filterTaseronEl ? filterTaseronEl.value : '';

  // Gather all todos
  let allTodos = [];
  
  // 1. Gather from surveys (Keşifler)
  (window.surveys || []).forEach(s => {
    if (s.todos && Array.isArray(s.todos)) {
      s.todos.forEach(t => {
        allTodos.push({
          ...t,
          surveyId: `survey_${s.id}`,
          surveyName: `[Keşif] ${s.santiye || s.otel || '-'}`
        });
      });
    }
  });

  // 2. Gather from proposals (Teklifler)
  (window.items || []).forEach(p => {
    if (p.todos && Array.isArray(p.todos)) {
      p.todos.forEach(t => {
        allTodos.push({
          ...t,
          surveyId: `proposal_${p.id}`,
          surveyName: `[Teklif] ${p.otel || p.santiye || p.aciklama || '-'}`
        });
      });
    }
  });

  // Filter
  const filtered = allTodos.filter(todo => {
    const queryMatch = !q || 
      (todo.text || '').toLowerCase().includes(q) || 
      (todo.surveyName || '').toLowerCase().includes(q);
    const taseronMatch = !fTaseron || todo.taseronId === fTaseron;
    return queryMatch && taseronMatch;
  });

  if (!filtered.length) {
    const emptyStateHtml = `<div style="text-align:center; padding:24px; color:var(--text3); font-size:13px;">Yapılacak iş bulunamadı.</div>`;
    tbody.innerHTML = `<tr><td colspan="7" style="padding:40px; text-align:center; background:transparent;">${emptyStateHtml}</td></tr>`;
    if (mobList) mobList.innerHTML = emptyStateHtml;
    return;
  }

  // Render desktop
  tbody.innerHTML = filtered.map(t => {
    const taseron = (window.taseronlar || []).find(x => x.id === t.taseronId);
    const taseronName = taseron ? taseron.name : '<span style="color:var(--text3); font-style:italic;">— Atanmadı —</span>';
    const mName = t.sorumlu ? t.sorumlu : '<span style="color:var(--text3); font-style:italic;">— Atanmadı —</span>';
    
    return `
      <tr>
        <td style="font-weight:700; max-width:200px; white-space:normal; line-height:1.3;">${escapeHTML(t.surveyName)}</td>
        <td style="font-weight:600;">${escapeHTML(t.text || 'Tanımsız İş')}</td>
        <td>${mName}</td>
        <td>${taseronName}</td>
        <td style="text-align:right; width:140px;">
          <input type="number" step="any" placeholder="0.00" value="${t.maliyet !== undefined ? t.maliyet : ''}" onchange="updateTodoState('${t.surveyId}', '${t.id}', 'maliyet', parseFloat(this.value) || 0)" style="width:100%; padding:4px 8px; border-radius:6px; border:1px solid var(--border); background:rgba(var(--card-rgb),0.3); color:var(--text); font-size:13px; font-weight:700; text-align:right;">
        </td>
        <td style="text-align:center; width:80px;">
          <input type="checkbox" ${t.done ? 'checked' : ''} onchange="updateTodoState('${t.surveyId}', '${t.id}', 'done', this.checked)" style="width:16px; height:16px; cursor:pointer; accent-color:var(--primary);">
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn-edit" style="padding:4px 6px; border-radius:6px;" onclick="openTodoModal('${t.id}', '${t.surveyId}')" aria-label="İşi Düzenle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-del" style="padding:4px 6px; border-radius:6px;" onclick="deleteTodoItem('${t.id}', '${t.surveyId}')" aria-label="İşi Sil">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Render mobile
  if (mobList) {
    mobList.innerHTML = filtered.map(t => {
      const taseron = (window.taseronlar || []).find(x => x.id === t.taseronId);
      const taseronName = taseron ? taseron.name : 'Atanmadı';
      const statusClass = t.done ? 'b-2' : 'b-0';
      
      return `
        <div class="mobile-card">
          <div class="mobile-card-header">
            <div>
              <div class="mobile-card-title">${escapeHTML(t.text || 'Tanımsız İş')}</div>
              <div style="font-size:11px; color:var(--text2); margin-top:4px; font-weight:700;">İlişkili: ${escapeHTML(t.surveyName)}</div>
            </div>
            <span class="badge ${statusClass}">${t.done ? 'Bitti' : 'Bekliyor'}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; border-bottom: 1px dashed var(--border); padding-bottom:10px; margin-bottom:10px;">
            <div><span style="color:var(--text2)">Sorumlu Mühendis:</span> ${escapeHTML(t.sorumlu || 'Atanmadı')}</div>
            <div><span style="color:var(--text2)">Taşeron:</span> ${escapeHTML(taseronName)}</div>
            <div><span style="color:var(--text2)">Maliyet:</span> ${fmtN(t.maliyet, '₺')}</div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-edit" style="padding:6px 10px; flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openTodoModal('${t.id}', '${t.surveyId}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Düzenle</button>
            <button class="btn-del" style="padding:6px 10px; flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="deleteTodoItem('${t.id}', '${t.surveyId}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Sil</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

async function updateTodoState(formattedSurveyId, todoId, field, value) {
  try {
    const parts = formattedSurveyId.split('_');
    const type = parts[0];
    const realId = parts[1];
    const collectionName = type === 'survey' ? 'surveys' : 'items';
    const surveyList = type === 'survey' ? window.surveys : window.items;

    const s = (surveyList || []).find(x => x.id === realId);
    if (!s || !Array.isArray(s.todos)) return;

    const updatedTodos = s.todos.map(t => {
      if (t.id === todoId) {
        return { ...t, [field]: value };
      }
      return t;
    });

    await col(collectionName).doc(realId).update({ todos: updatedTodos });
    s.todos = updatedTodos;

    showToast('Yapılacak iş güncellendi.');
    renderTodoList();
    if (typeof renderTaseron === 'function') {
      renderTaseron();
    }
  } catch (e) {
    showToast('Güncelleme hatası: ' + e.message, 'error');
  }
}

function openTodoModal(todoId, formattedSurveyId) {
  editTodoId = todoId;
  editTodoSurveyId = formattedSurveyId;
  const isEdit = todoId !== null;

  document.getElementById('todoModalTitle').textContent = isEdit ? 'İşi Düzenle' : 'Yapılacak İş Ekle';
  document.getElementById('saveTodoBtn').textContent = isEdit ? 'Güncelle' : 'Kaydet';

  // Populate dropdowns
  document.getElementById('ft_kesif').innerHTML = getSurveySelectOptions(formattedSurveyId);
  document.getElementById('ft_sorumlu').innerHTML = getUserSelectOptions('');
  document.getElementById('ft_taseron').innerHTML = getTaseronSelectOptions('');

  if (isEdit) {
    const parts = formattedSurveyId.split('_');
    const type = parts[0];
    const realId = parts[1];
    const surveyList = type === 'survey' ? window.surveys : window.items;

    const s = (surveyList || []).find(x => x.id === realId);
    if (!s || !Array.isArray(s.todos)) return;
    const todo = s.todos.find(x => x.id === todoId);
    if (!todo) return;

    document.getElementById('ft_text').value = todo.text || '';
    document.getElementById('ft_sorumlu').value = todo.sorumlu || '';
    document.getElementById('ft_taseron').value = todo.taseronId || '';
    document.getElementById('ft_maliyet').value = todo.maliyet !== undefined ? todo.maliyet : '';
    document.getElementById('ft_done').checked = !!todo.done;
  } else {
    document.getElementById('ft_text').value = '';
    document.getElementById('ft_sorumlu').value = '';
    document.getElementById('ft_taseron').value = '';
    document.getElementById('ft_maliyet').value = '';
    document.getElementById('ft_done').checked = false;
  }

  document.getElementById('todoModalBg').classList.add('open');
  document.getElementById('ft_text').focus();
}

function closeTodoModal() {
  document.getElementById('todoModalBg').classList.remove('open');
  editTodoId = null;
  editTodoSurveyId = null;
}

async function saveTodoItem() {
  const formattedSurveyId = document.getElementById('ft_kesif').value;
  const text = document.getElementById('ft_text').value.trim();
  const sorumlu = document.getElementById('ft_sorumlu').value;
  const taseronId = document.getElementById('ft_taseron').value;
  const maliyet = parseFloat(document.getElementById('ft_maliyet').value) || 0;
  const done = document.getElementById('ft_done').checked;

  if (!formattedSurveyId) {
    showToast('Lütfen ilişkili bir keşif veya teklif seçin!', 'error');
    return;
  }
  if (!text) {
    showToast('Lütfen iş tanımı girin!', 'error');
    return;
  }

  const saveBtn = document.getElementById('saveTodoBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Kaydediliyor...';

  try {
    const parts = formattedSurveyId.split('_');
    const newType = parts[0];
    const newRealId = parts[1];
    const newCollection = newType === 'survey' ? 'surveys' : 'items';
    const newSurveyList = newType === 'survey' ? window.surveys : window.items;

    if (editTodoId) {
      // Edit mode
      const oldParts = editTodoSurveyId.split('_');
      const oldType = oldParts[0];
      const oldRealId = oldParts[1];
      const oldCollection = oldType === 'survey' ? 'surveys' : 'items';
      const oldSurveyList = oldType === 'survey' ? window.surveys : window.items;

      const oldSurvey = (oldSurveyList || []).find(x => x.id === oldRealId);
      const newSurvey = (newSurveyList || []).find(x => x.id === newRealId);

      if (editTodoSurveyId !== formattedSurveyId) {
        // Project changed: delete from old, add to new
        if (oldSurvey && Array.isArray(oldSurvey.todos)) {
          const filteredTodos = oldSurvey.todos.filter(x => x.id !== editTodoId);
          await col(oldCollection).doc(oldRealId).update({ todos: filteredTodos });
          oldSurvey.todos = filteredTodos;
        }

        if (newSurvey) {
          if (!Array.isArray(newSurvey.todos)) newSurvey.todos = [];
          const newTodo = { id: editTodoId, text, sorumlu, taseronId, maliyet, done };
          newSurvey.todos.push(newTodo);
          await col(newCollection).doc(newRealId).update({ todos: newSurvey.todos });
        }
      } else {
        // Project didn't change: edit in place
        if (oldSurvey && Array.isArray(oldSurvey.todos)) {
          const updatedTodos = oldSurvey.todos.map(t => {
            if (t.id === editTodoId) {
              return { ...t, text, sorumlu, taseronId, maliyet, done };
            }
            return t;
          });
          await col(newCollection).doc(newRealId).update({ todos: updatedTodos });
          oldSurvey.todos = updatedTodos;
        }
      }
      showToast('Yapılacak iş başarıyla güncellendi.');
    } else {
      // New mode
      const targetSurvey = (newSurveyList || []).find(x => x.id === newRealId);
      if (!targetSurvey) return;

      if (!Array.isArray(targetSurvey.todos)) targetSurvey.todos = [];
      const newTodo = {
        id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text,
        sorumlu,
        taseronId,
        maliyet,
        done
      };
      targetSurvey.todos.push(newTodo);
      await col(newCollection).doc(newRealId).update({ todos: targetSurvey.todos });
      showToast('Yeni yapılacak iş eklendi.');
    }

    closeTodoModal();
    renderTodoList();
    if (typeof renderTaseron === 'function') {
      renderTaseron();
    }
  } catch (e) {
    showToast('Kayıt hatası: ' + e.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = editTodoId ? 'Güncelle' : 'Kaydet';
  }
}

async function deleteTodoItem(todoId, formattedSurveyId) {
  const ok = await showConfirm('İşi Sil', 'Bu yapılacak iş kaydını silmek istediğinize emin misiniz?', true);
  if (!ok) return;

  try {
    const parts = formattedSurveyId.split('_');
    const type = parts[0];
    const realId = parts[1];
    const collectionName = type === 'survey' ? 'surveys' : 'items';
    const surveyList = type === 'survey' ? window.surveys : window.items;

    const s = (surveyList || []).find(x => x.id === realId);
    if (!s || !Array.isArray(s.todos)) return;

    const filteredTodos = s.todos.filter(t => t.id !== todoId);
    await col(collectionName).doc(realId).update({ todos: filteredTodos });
    s.todos = filteredTodos;

    showToast('Yapılacak iş silindi.');
    renderTodoList();
    if (typeof renderTaseron === 'function') {
      renderTaseron();
    }
  } catch (e) {
    showToast('Silme hatası: ' + e.message, 'error');
  }
}

function openKesifModal(id){
  editKesifId = id;
  const isEdit = (id !== null);
  document.getElementById('kesifModalTitle').textContent = isEdit ? 'Keşif Düzenle' : 'Yeni Keşif Ekle';
  document.getElementById('saveKesifBtn').textContent = isEdit ? 'Güncelle' : 'Kaydet';
  
  // Populate mahal dropdown
  const sel = document.getElementById('fk_mahal');
  const sortedMahals = [...mahals].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  sel.innerHTML = '<option value="">— işveren seçin —</option>' + sortedMahals.map(m=>`<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  
  if (isEdit) {
    const it = surveys.find(x => x.id === id);
    if (!it) return;
    document.getElementById('fk_mahal').value = it.mahalId || '';
    document.getElementById('fk_otel').value = it.santiye || it.otel || '';
    document.getElementById('fk_kat').value = it.kat || 'İnşaat';
    document.getElementById('fk_durum').value = it.durum || 'Keşif Bekliyor';
    document.getElementById('fk_ktar').value = it.ktar || '';
    document.getElementById('fk_sorumlu').value = it.sorumlu || '';
    document.getElementById('fk_notlar').value = it.notlar || '';
  } else {
    document.getElementById('fk_mahal').value = document.getElementById('fMahal').value || '';
    document.getElementById('fk_otel').value = '';
    
    // Determine default category based on user's job / department
    let defaultKat = 'İnşaat';
    let defaultSorumlu = currentUser ? currentUser.u : '';
    
    if (currentUser) {
      const raw = localStorage.getItem('profile_' + currentUser.u);
      if (raw) {
        const profile = JSON.parse(raw);
        if (profile.name) {
          defaultSorumlu = profile.name;
        }
        const job = (profile.job || '').toLowerCase();
        if (job.includes('makine') || job.includes('mekanik')) {
          defaultKat = 'Mekanik';
        } else if (job.includes('elektrik')) {
          defaultKat = 'Elektrik';
        } else if (job.includes('inşaat') || job.includes('mimar')) {
          defaultKat = 'İnşaat';
        } else if (job) {
          defaultKat = 'Diğer';
        }
      }
    }
    
    document.getElementById('fk_kat').value = defaultKat;
    document.getElementById('fk_durum').value = 'Keşif Bekliyor';
    document.getElementById('fk_ktar').value = today();
    document.getElementById('fk_sorumlu').value = defaultSorumlu;
    document.getElementById('fk_notlar').value = '';
  }
  
  document.getElementById('kesifModalBg').classList.add('open');
  document.getElementById('fk_mahal').focus();
}

function closeKesifModal(){
  document.getElementById('kesifModalBg').classList.remove('open');
  editKesifId = null;
}

async function saveKesif(){
  const btn = document.getElementById('saveKesifBtn');
  btn.disabled = true;
  btn.textContent = 'Kaydediliyor...';
  
  try {
    const mahalId = document.getElementById('fk_mahal').value;
    const otel = document.getElementById('fk_otel').value.trim();
    const kat = document.getElementById('fk_kat').value;
    const durum = document.getElementById('fk_durum').value;
    const ktar = document.getElementById('fk_ktar').value;
    const sorumlu = document.getElementById('fk_sorumlu').value.trim();
    const notlar = document.getElementById('fk_notlar').value.trim();
    
    if (!mahalId) {
      showToast('Lütfen bir işveren seçin!', 'error');
      btn.disabled = false;
      btn.textContent = editKesifId ? 'Güncelle' : 'Kaydet';
      return;
    }
    if (!otel) {
      showToast('Şantiye / Otel / Proje adı gereklidir!', 'error');
      btn.disabled = false;
      btn.textContent = editKesifId ? 'Güncelle' : 'Kaydet';
      return;
    }
    
    let expectedKat = 'İnşaat';
    if (currentUser) {
      const raw = localStorage.getItem('profile_' + currentUser.u);
      if (raw) {
        const profile = JSON.parse(raw);
        const job = (profile.job || '').toLowerCase();
        if (job.includes('makine') || job.includes('mekanik')) expectedKat = 'Mekanik';
        else if (job.includes('elektrik')) expectedKat = 'Elektrik';
        else if (job.includes('inşaat') || job.includes('mimar')) expectedKat = 'İnşaat';
        else if (job) expectedKat = 'Diğer';
      }
    }
    
    if (kat !== expectedKat && !window.kesifKatConfirmed) {
      btn.disabled = false;
      btn.textContent = editKesifId ? 'Güncelle' : 'Kaydet';
      if (typeof showAlertModal === 'function') {
        showAlertModal(`Seçtiğiniz kategori (${kat}), profilinizle eşleşen standart birim ile (${expectedKat}) uyuşmuyor. Yine de kaydetmek istiyor musunuz?`, () => {
          window.kesifKatConfirmed = true;
          saveKesif();
        });
        return;
      }
    }
    window.kesifKatConfirmed = false;
    
    let existingTodos = [];
    if (editKesifId) {
      const it = surveys.find(x => x.id === editKesifId);
      if (it && Array.isArray(it.todos)) {
        existingTodos = it.todos;
      }
    }

    const data = {
      mahalId,
      otel,
      santiye: otel,
      kat,
      durum,
      ktar,
      sorumlu,
      notlar,
      todos: existingTodos,
      lastEditedBy: currentUser ? currentUser.u : 'system'
    };
    
    if (editKesifId) {
      await col('surveys').doc(editKesifId).update(data);
      const idx = surveys.findIndex(x => x.id === editKesifId);
      if (idx >= 0) surveys[idx] = { ...surveys[idx], ...data };
      showToast('Keşif başarıyla güncellendi.');
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const ref = await col('surveys').add(data);
      surveys.unshift({ id: ref.id, ...data });
      showToast('Yeni keşif başarıyla eklendi.');
    }
    closeKesifModal();
    renderKesif();
    
    // Also trigger taseron cari updates because hakedis of subcontractors might change
    if (typeof renderTaseron === 'function') {
      renderTaseron();
    }
  } catch (e) {
    showToast('Keşif kaydedilirken hata oluştu: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = editKesifId ? 'Güncelle' : 'Kaydet';
  }
}

async function delKesif(id){
  const ok = await showConfirm('Keşfi Sil', 'Bu keşif kaydını silmek istediğinize emin misiniz?', true);
  if (!ok) return;
  try {
    await col('surveys').doc(id).delete();
    surveys = surveys.filter(x => x.id !== id);
    showToast('Keşif başarıyla silindi.');
    renderKesif();
  } catch (e) {
    showToast('Keşif silinirken hata oluştu: ' + e.message, 'error');
  }
}

function convertToProposal(id){
  const it = surveys.find(x => x.id === id);
  if (!it) return;
  
  convertingSurveyId = id;
  
  // Open the proposal modal
  openModal(null);
  
  // Prepopulate modal values
  document.getElementById('f_mahal').value = it.mahalId || '';
  document.getElementById('f_otel').value = (it.santiye || it.otel || '') + ' (Keşif Sonucu)';
  document.getElementById('f_kat').value = it.kat || 'İnşaat';
  document.getElementById('f_durum').value = 'Gönderilecek';
  
  showToast('Keşif bilgileri teklif formuna aktarıldı. Kaydedildiğinde keşif durumu güncellenecektir.', 'info');
}

let selectedTaseronId = null;

function renderTaseron() {
  renderTaseronList();
  renderTaseronCari();
}

// Fetch subcontractor balance
function calculateTaseronBalance(taseronId) {
  let hakedisTotal = 0;
  let odenenTotal = 0;
  
  // Calculate completed hakedis from surveys
  (window.surveys || []).forEach(s => {
    if (s.todos && Array.isArray(s.todos)) {
      s.todos.forEach(t => {
        if (t.taseronId === taseronId && t.done) {
          hakedisTotal += parseFloat(t.maliyet) || 0;
        }
      });
    }
  });

  // Calculate completed hakedis from proposals (items)
  (window.items || []).forEach(p => {
    if (p.todos && Array.isArray(p.todos)) {
      p.todos.forEach(t => {
        if (t.taseronId === taseronId && t.done) {
          hakedisTotal += parseFloat(t.maliyet) || 0;
        }
      });
    }
  });
  
  // Calculate paid total from payments
  (window.taseron_payments || []).forEach(p => {
    if (p.taseronId === taseronId) {
      odenenTotal += parseFloat(p.amount) || 0;
    }
  });
  
  return {
    hakedis: hakedisTotal,
    odenen: odenenTotal,
    bakiye: hakedisTotal - odenenTotal
  };
}

// Render subcontractor list in the left panel
function renderTaseronList() {
  const wrap = document.getElementById('taseronListWrap');
  if (!wrap) return;
  
  const q = (document.getElementById('srchTaseron').value || '').toLowerCase();
  const branch = document.getElementById('fBranchTaseron').value;
  
  const filtered = (window.taseronlar || []).filter(t => {
    const nameMatch = (t.name || '').toLowerCase().includes(q);
    const branchMatch = !branch || t.branch === branch;
    return nameMatch && branchMatch;
  });
  
  if (!filtered.length) {
    wrap.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text3); font-size:13px;">Taşeron bulunamadı.</div>`;
    return;
  }
  
  // Sort alphabetically
  filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  
  let html = '';
  filtered.forEach(t => {
    const bal = calculateTaseronBalance(t.id);
    const activeCls = t.id === selectedTaseronId ? 'active' : '';
    const bakiyeColor = bal.bakiye > 0 ? 'var(--red)' : (bal.bakiye < 0 ? 'var(--green)' : 'var(--text2)');
    
    html += `
      <div class="taseron-list-item ${activeCls}" onclick="selectTaseron('${t.id}')" style="padding:12px; border:1px solid var(--border); border-radius:10px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center; background: ${t.id === selectedTaseronId ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent'};">
        <div>
          <div style="font-weight:700; color:var(--text); font-size:14px;">${escapeHTML(t.name)}</div>
          <div style="font-size:11px; color:var(--text2); text-transform:uppercase; margin-top:2px;">${escapeHTML(t.branch || 'Genel')}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; font-size:14px; color:${bakiyeColor};">${fmtN(bal.bakiye, '₺')}</div>
          <div style="font-size:10px; color:var(--text3); margin-top:2px;">Güncel Bakiye</div>
        </div>
      </div>
    `;
  });
  
  wrap.innerHTML = html;
}

// Select a subcontractor
function selectTaseron(id) {
  selectedTaseronId = id;
  renderTaseronList();
  renderTaseronCari();
  if (window.innerWidth <= 992) {
    const cariPanel = document.getElementById('taseronCariPanel');
    if (cariPanel) {
      setTimeout(() => {
        cariPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}

// Add new subcontractor
async function addTaseron() {
  const nameInput = document.getElementById('new_taseron_name');
  const branchInput = document.getElementById('new_taseron_branch');
  if (!nameInput || !branchInput) return;
  
  const name = nameInput.value.trim();
  const branch = branchInput.value;
  
  if (!name) {
    showToast('Lütfen taşeron adı girin!', 'error');
    return;
  }
  
  try {
    const data = {
      name,
      branch,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await col('taseronlar').add(data);
    
    // Optimistic UI update
    taseronlar.unshift({ id: ref.id, ...data });
    
    nameInput.value = '';
    showToast('Taşeron başarıyla eklendi.');
    renderTaseron();
  } catch (e) {
    showToast('Taşeron eklenirken hata: ' + e.message, 'error');
  }
}

// Update subcontractor job maliyet or done state
async function updateTaseronJob(formattedSurveyId, todoId, field, value) {
  try {
    const parts = formattedSurveyId.split('_');
    const type = parts[0];
    const realId = parts[1];
    const collectionName = type === 'survey' ? 'surveys' : 'items';
    const surveyList = type === 'survey' ? window.surveys : window.items;

    const survey = (surveyList || []).find(x => x.id === realId);
    if (!survey || !Array.isArray(survey.todos)) return;
    
    const updatedTodos = survey.todos.map(t => {
      if (t.id === todoId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    
    await col(collectionName).doc(realId).update({
      todos: updatedTodos
    });
    
    // Update local cache
    survey.todos = updatedTodos;
    
    showToast('Cari hareket güncellendi.');
    renderTaseron();
  } catch (e) {
    showToast('Güncelleme sırasında hata oluştu: ' + e.message, 'error');
  }
}

// Render subcontractor cari detailed view on the right panel
function renderTaseronCari() {
  const panel = document.getElementById('taseronCariPanel');
  if (!panel) return;
  
  if (!selectedTaseronId) {
    panel.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; gap: 16px; color: var(--text3); text-align: center; padding: 40px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <div>
          <div style="font-size: 16px; font-weight: 750; color: var(--text); margin-bottom: 4px;">Taşeron Seçilmedi</div>
          <div style="font-size: 13px;">Cari kartını, hak edişlerini ve ödeme hareketlerini görüntülemek için sol listeden bir taşeron seçin.</div>
        </div>
      </div>
    `;
    return;
  }
  
  const t = (window.taseronlar || []).find(x => x.id === selectedTaseronId);
  if (!t) {
    selectedTaseronId = null;
    renderTaseron();
    return;
  }
  
  const bal = calculateTaseronBalance(t.id);
  
  // Completed & Pending jobs (hakedis)
  let jobsHtml = '';
  let assignedJobsCount = 0;
  // 1. Jobs from surveys (Keşifler)
  (window.surveys || []).forEach(s => {
    if (s.todos && Array.isArray(s.todos)) {
      s.todos.forEach(todo => {
        if (todo.taseronId === t.id) {
          assignedJobsCount++;
          jobsHtml += `
            <tr>
              <td>
                <div style="font-weight:750; color:var(--text);">[Keşif] ${escapeHTML(s.santiye || s.otel || '-')}</div>
                <div style="font-size:10px; color:var(--text2); margin-top:2px;"><span class="mahal-tag">${escapeHTML(getMahalName(s.mahalId))}</span></div>
              </td>
              <td>
                <div style="font-weight:600; color:var(--text);">${escapeHTML(todo.text || 'Tanımsız İş')}</div>
                <div style="font-size:11px; color:var(--text2); margin-top:2px;">Müh: ${escapeHTML(todo.sorumlu || 'Atanmadı')}</div>
              </td>
              <td style="width: 140px;">
                <input type="number" step="any" placeholder="0.00" value="${todo.maliyet !== undefined ? todo.maliyet : ''}" onchange="updateTaseronJob('survey_${s.id}', '${todo.id}', 'maliyet', parseFloat(this.value) || 0)" style="width:100%; padding:6px 10px; border-radius:8px; border:1px solid var(--border); background:rgba(var(--card-rgb),0.5); color:var(--text); font-size:13px; font-weight:700; text-align:right;">
              </td>
              <td style="text-align:center; width: 60px;">
                <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="updateTaseronJob('survey_${s.id}', '${todo.id}', 'done', this.checked)" style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
              </td>
            </tr>
          `;
        }
      });
    }
  });

  // 2. Jobs from proposals (Teklifler)
  (window.items || []).forEach(p => {
    if (p.todos && Array.isArray(p.todos)) {
      p.todos.forEach(todo => {
        if (todo.taseronId === t.id) {
          assignedJobsCount++;
          jobsHtml += `
            <tr>
              <td>
                <div style="font-weight:750; color:var(--text);">[Teklif] ${escapeHTML(p.otel || p.santiye || p.aciklama || '-')}</div>
                <div style="font-size:10px; color:var(--text2); margin-top:2px;"><span class="mahal-tag">${escapeHTML(getMahalName(p.mahalId))}</span></div>
              </td>
              <td>
                <div style="font-weight:600; color:var(--text);">${escapeHTML(todo.text || 'Tanımsız İş')}</div>
                <div style="font-size:11px; color:var(--text2); margin-top:2px;">Müh: ${escapeHTML(todo.sorumlu || 'Atanmadı')}</div>
              </td>
              <td style="width: 140px;">
                <input type="number" step="any" placeholder="0.00" value="${todo.maliyet !== undefined ? todo.maliyet : ''}" onchange="updateTaseronJob('proposal_${p.id}', '${todo.id}', 'maliyet', parseFloat(this.value) || 0)" style="width:100%; padding:6px 10px; border-radius:8px; border:1px solid var(--border); background:rgba(var(--card-rgb),0.5); color:var(--text); font-size:13px; font-weight:700; text-align:right;">
              </td>
              <td style="text-align:center; width: 60px;">
                <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="updateTaseronJob('proposal_${p.id}', '${todo.id}', 'done', this.checked)" style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
              </td>
            </tr>
          `;
        }
      });
    }
  });
  
  if (!jobsHtml) {
    jobsHtml = `<tr><td colspan="4" style="text-align:center; color:var(--text3); padding:20px;">Atanan iş bulunmamaktadır.</td></tr>`;
  }
  
  // Payments
  let paymentsHtml = '';
  const myPayments = (window.taseron_payments || []).filter(p => p.taseronId === t.id);
  
  if (myPayments.length) {
    myPayments.forEach(p => {
      paymentsHtml += `
        <tr>
          <td>${escapeHTML(fmt(p.date))}</td>
          <td>${escapeHTML(p.desc || 'Ödeme')}</td>
          <td style="text-align:right; font-weight:700; color:var(--green);">${fmtN(p.amount, '₺')}</td>
          <td style="text-align:center; width:40px;">
            <button class="btn-del" style="padding:4px 6px; border-radius:6px;" onclick="delPayment('${p.id}')" aria-label="Ödemeyi sil">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    });
  } else {
    paymentsHtml = `<tr><td colspan="4" style="text-align:center; color:var(--text3); padding:20px;">Yapılan ödeme kaydı bulunmamaktadır.</td></tr>`;
  }
  
  const bakiyeColor = bal.bakiye > 0 ? 'var(--red)' : (bal.bakiye < 0 ? 'var(--green)' : 'var(--text2)');
  
  panel.innerHTML = `
    <!-- Cari Başlık ve Bilgileri -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:20px;" class="flex-col-mobile">
      <div>
        <h2 style="font-size:20px; font-weight:800; color:var(--text); margin:0;">${escapeHTML(t.name)}</h2>
        <div style="font-size:12px; color:var(--text2); text-transform:uppercase; margin-top:4px; font-weight:600;">Branş: ${escapeHTML(t.branch || 'Genel')}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn-del" onclick="deleteTaseron('${t.id}')" style="padding: 8px 12px; font-size:13px; display:inline-flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Taşeronu Sil
        </button>
      </div>
    </div>
    
    <!-- Finansal Kartlar -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:24px;" class="grid-3-mobile">
      <div style="padding:16px; border:1px solid var(--border); border-radius:12px; background:rgba(var(--card-rgb), 0.02);">
        <div style="font-size:11px; color:var(--text2); font-weight:700; text-transform:uppercase;">Toplam Hak Ediş</div>
        <div style="font-size:20px; font-weight:850; color:var(--text); margin-top:6px;">${fmtN(bal.hakedis, '₺')}</div>
      </div>
      <div style="padding:16px; border:1px solid var(--border); border-radius:12px; background:rgba(var(--card-rgb), 0.02);">
        <div style="font-size:11px; color:var(--text2); font-weight:700; text-transform:uppercase;">Toplam Ödeme</div>
        <div style="font-size:20px; font-weight:850; color:var(--green); margin-top:6px;">${fmtN(bal.odenen, '₺')}</div>
      </div>
      <div style="padding:16px; border:1px solid var(--border); border-radius:12px; background:rgba(var(--card-rgb), 0.04);">
        <div style="font-size:11px; color:var(--text2); font-weight:700; text-transform:uppercase;">Güncel Bakiye</div>
        <div style="font-size:20px; font-weight:850; color:${bakiyeColor}; margin-top:6px;">${fmtN(bal.bakiye, '₺')}</div>
      </div>
    </div>
    
    <!-- Sekmeli Alt Bilgiler -->
    <div style="display:flex; flex-direction:column; gap:24px; flex-grow:1;">
      
      <!-- HAK EDİŞLER VE İŞLER -->
      <div>
        <h3 style="font-size:14px; font-weight:800; color:var(--text); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.03em; display:flex; align-items:center; gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Atanan İşler ve Hak Ediş Girişleri (${assignedJobsCount})
        </h3>
        <div class="table-wrap" style="margin:0; box-shadow:none; border:1px solid var(--border); border-radius:12px; overflow-x:auto;">
          <table class="list-table" style="width:100%; border-collapse:collapse; min-width:450px;">
            <thead>
              <tr>
                <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:left;">Proje / İşveren</th>
                <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:left;">İş Tanımı / Mühendis</th>
                <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:right; width: 140px;">Ücret / Maliyet</th>
                <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:center; width: 60px;">Bitti</th>
              </tr>
            </thead>
            <tbody>
              ${jobsHtml}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- ÖDEMELER GEÇMİŞİ VE FORMU -->
      <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px;" class="grid-2-mobile">
        
        <!-- Liste -->
        <div>
          <h3 style="font-size:14px; font-weight:800; color:var(--text); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.03em; display:flex; align-items:center; gap:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Ödeme Hareketleri
          </h3>
          <div class="table-wrap" style="margin:0; box-shadow:none; border:1px solid var(--border); border-radius:12px; overflow-x:auto;">
            <table class="list-table" style="width:100%; border-collapse:collapse; min-width:350px;">
              <thead>
                <tr>
                  <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:left;">Tarih</th>
                  <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:left;">Açıklama</th>
                  <th style="font-size:11px; text-transform:uppercase; padding:10px 12px; text-align:right;">Tutar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${paymentsHtml}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Ekleme Formları -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Ödeme Ekle Formu -->
          <div>
            <h3 style="font-size:14px; font-weight:800; color:var(--text); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.03em; display:flex; align-items:center; gap:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Ödeme Ekle
            </h3>
            <div style="border:1px solid var(--border); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; background:rgba(var(--card-rgb), 0.01);">
              <div class="fg">
                <label for="pay_amount">Ödeme Tutarı (₺)</label>
                <input id="pay_amount" type="number" step="0.01" placeholder="0.00" style="font-size:15px; font-weight:700;">
              </div>
              <div class="fg">
                <label for="pay_date">Ödeme Tarihi</label>
                <input id="pay_date" type="date">
              </div>
              <div class="fg">
                <label for="pay_desc">Açıklama / Makbuz / Banka Detayı</label>
                <input id="pay_desc" type="text" placeholder="Örn: Yapı Kredi Bankası Havale">
              </div>
              <button class="btn-save" onclick="addPayment()" style="width:100%; justify-content:center; padding:10px 16px; margin-top:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Ödeme Kaydet
              </button>
            </div>
          </div>

          <!-- İş / Hak Ediş Ekle Formu -->
          <div>
            <h3 style="font-size:14px; font-weight:800; color:var(--text); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.03em; display:flex; align-items:center; gap:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              İş / Hak Ediş Ekle
            </h3>
            <div style="border:1px solid var(--border); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; background:rgba(var(--card-rgb), 0.01);">
              <div class="fg">
                <label for="add_job_survey_id">İlişkili Keşif / Proje</label>
                <select id="add_job_survey_id" style="width: 100%;">
                  ${getSurveyDropdownOptions()}
                </select>
              </div>
              <div class="fg">
                <label for="add_job_text">İş Tanımı</label>
                <input id="add_job_text" type="text" placeholder="Örn: Seramik Döşeme İşleri">
              </div>
              <div class="fg">
                <label for="add_job_sorumlu">Sorumlu Mühendis</label>
                <select id="add_job_sorumlu" style="width: 100%;">
                  ${getUsersDropdownOptions()}
                </select>
              </div>
              <div class="fg">
                <label for="add_job_maliyet">Tutar / Ücret (₺)</label>
                <input id="add_job_maliyet" type="number" step="any" placeholder="0.00" style="font-size:15px; font-weight:700;">
              </div>
              <div class="fg" style="display:flex; align-items:center; gap:8px;">
                <input id="add_job_done" type="checkbox" checked style="width:16px; height:16px; cursor:pointer;">
                <label for="add_job_done" style="margin-bottom:0; cursor:pointer;">İş Bitti (Hak Edişe Yansıt)</label>
              </div>
              <button class="btn-save" onclick="addTaseronManualJob()" style="width:100%; justify-content:center; padding:10px 16px; margin-top:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                İş Ata / Kaydet
              </button>
            </div>
          </div>

        </div>
        
      </div>
      
    </div>
  `;
  
  // Set default date to today
  const payDateEl = document.getElementById('pay_date');
  if (payDateEl) payDateEl.value = today();
}

// Add a payment record
async function addPayment() {
  if (!selectedTaseronId) return;
  
  const amountEl = document.getElementById('pay_amount');
  const dateEl = document.getElementById('pay_date');
  const descEl = document.getElementById('pay_desc');
  
  if (!amountEl || !dateEl || !descEl) return;
  
  const amount = parseFloat(amountEl.value) || 0;
  const date = dateEl.value;
  const desc = descEl.value.trim();
  
  if (amount <= 0) {
    showToast('Lütfen geçerli bir ödeme tutarı girin!', 'error');
    return;
  }
  
  try {
    const data = {
      taseronId: selectedTaseronId,
      amount,
      date,
      desc,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      addedBy: currentUser ? currentUser.u : 'system'
    };
    
    const ref = await col('taseron_payments').add(data);
    
    // Optimistic UI update
    taseron_payments.unshift({ id: ref.id, ...data });
    
    amountEl.value = '';
    descEl.value = '';
    
    showToast('Ödeme kaydı başarıyla eklendi.');
    renderTaseron();
  } catch (e) {
    showToast('Ödeme eklenirken hata: ' + e.message, 'error');
  }
}

// Delete subcontractor
async function deleteTaseron(id) {
  const ok = await showConfirm('Taşeronu Sil', 'Bu taşeron kaydını silmek istediğinize emin misiniz? (Ödeme ve hakediş geçmişi silinmez ancak ilişkiler kaybolur.)', true);
  if (!ok) return;
  
  try {
    await col('taseronlar').doc(id).delete();
    
    // Remove from local cache
    const idx = taseronlar.findIndex(x => x.id === id);
    if (idx >= 0) taseronlar.splice(idx, 1);
    
    if (selectedTaseronId === id) {
      selectedTaseronId = null;
    }
    
    showToast('Taşeron silindi.');
    renderTaseron();
  } catch (e) {
    showToast('Taşeron silinirken hata: ' + e.message, 'error');
  }
}

// Delete payment
async function delPayment(id) {
  const ok = await showConfirm('Ödemeyi Sil', 'Bu ödeme hareketini silmek istediğinize emin misiniz?', true);
  if (!ok) return;
  
  try {
    await col('taseron_payments').doc(id).delete();
    
    // Remove from local cache
    const idx = taseron_payments.findIndex(x => x.id === id);
    if (idx >= 0) taseron_payments.splice(idx, 1);
    
    showToast('Ödeme kaydı silindi.');
    renderTaseron();
  } catch (e) {
    showToast('Ödeme silinirken hata: ' + e.message, 'error');
  }
}

function getSurveyDropdownOptions() {
  let options = '<option value="">— Keşif veya Teklif Seçin —</option>';
  
  // 1. Keşifler (Surveys)
  const sortedSurveys = [...(window.surveys || [])].sort((a,b) => {
    const nameA = a.santiye || a.otel || '';
    const nameB = b.santiye || b.otel || '';
    return nameA.localeCompare(nameB, 'tr');
  });
  if (sortedSurveys.length > 0) {
    options += '<optgroup label="Keşifler (Site Surveys)">';
    sortedSurveys.forEach(s => {
      const label = `${escapeHTML(s.santiye || s.otel || '-')} (${escapeHTML(getMahalName(s.mahalId))})`;
      options += `<option value="survey_${s.id}">${label}</option>`;
    });
    options += '</optgroup>';
  }

  // 2. Teklifler (Proposals)
  const sortedItems = [...(window.items || [])].sort((a,b) => {
    const nameA = a.otel || a.santiye || a.aciklama || '';
    const nameB = b.otel || b.santiye || b.aciklama || '';
    return nameA.localeCompare(nameB, 'tr');
  });
  if (sortedItems.length > 0) {
    options += '<optgroup label="Teklifler (Proposals)">';
    sortedItems.forEach(p => {
      const label = `${escapeHTML(p.otel || p.santiye || p.aciklama || '-')} (${escapeHTML(getMahalName(p.mahalId))})`;
      options += `<option value="proposal_${p.id}">${label}</option>`;
    });
    options += '</optgroup>';
  }

  return options;
}

function getUsersDropdownOptions() {
  let options = '<option value="">— Mühendis Seçilmedi —</option>';
  const sortedUsers = [...(window.users || [])].sort((a,b) => (a.u || '').localeCompare(b.u || ''));
  sortedUsers.forEach(usr => {
    const displayName = usr.name ? `${usr.name} (${usr.u})` : usr.u;
    options += `<option value="${usr.u}">${escapeHTML(displayName)}</option>`;
  });
  return options;
}

async function addTaseronManualJob() {
  if (!selectedTaseronId) return;

  const surveyIdEl = document.getElementById('add_job_survey_id');
  const textEl = document.getElementById('add_job_text');
  const sorumluEl = document.getElementById('add_job_sorumlu');
  const maliyetEl = document.getElementById('add_job_maliyet');
  const doneEl = document.getElementById('add_job_done');

  if (!surveyIdEl || !textEl || !sorumluEl || !maliyetEl || !doneEl) return;

  const formattedSurveyId = surveyIdEl.value;
  const text = textEl.value.trim();
  const sorumlu = sorumluEl.value;
  const maliyet = parseFloat(maliyetEl.value) || 0;
  const done = doneEl.checked;

  if (!formattedSurveyId) {
    showToast('Lütfen ilişkili bir keşif veya teklif seçin!', 'error');
    return;
  }
  if (!text) {
    showToast('Lütfen iş tanımı girin!', 'error');
    return;
  }

  try {
    const parts = formattedSurveyId.split('_');
    const type = parts[0];
    const realId = parts[1];
    const collectionName = type === 'survey' ? 'surveys' : 'items';
    const surveyList = type === 'survey' ? window.surveys : window.items;

    const targetSurvey = (surveyList || []).find(x => x.id === realId);
    if (!targetSurvey) return;

    if (!Array.isArray(targetSurvey.todos)) targetSurvey.todos = [];

    const newTodo = {
      id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      text,
      sorumlu,
      taseronId: selectedTaseronId,
      maliyet,
      done
    };

    targetSurvey.todos.push(newTodo);
    await col(collectionName).doc(realId).update({
      todos: targetSurvey.todos
    });

    // Reset form fields
    textEl.value = '';
    maliyetEl.value = '';

    showToast('Yeni iş taşerona başarıyla atandı.');
    renderTaseron();
    if (typeof renderTodoList === 'function') {
      renderTodoList();
    }
  } catch (e) {
    showToast('İş eklenirken hata oluştu: ' + e.message, 'error');
  }
}

// Expose variables globally
window.renderTaseron = renderTaseron;
window.renderTaseronList = renderTaseronList;
window.renderTaseronCari = renderTaseronCari;
window.selectTaseron = selectTaseron;
window.addTaseron = addTaseron;
window.updateTaseronJob = updateTaseronJob;
window.addPayment = addPayment;
window.deleteTaseron = deleteTaseron;
window.delPayment = delPayment;
window.addTaseronManualJob = addTaseronManualJob;
window.getSurveyDropdownOptions = getSurveyDropdownOptions;
window.getUsersDropdownOptions = getUsersDropdownOptions;



// ── Günlük İş Raporları (Daily Work Reports) ───────────────────
function addUnitRow(values = { birimAdi: '', ekip: '', faaliyet: '', malzeme: '', mahalId: '' }) {
  const container = document.getElementById('reportUnitsContainer');
  if (!container) return;
  
  const sortedMahals = [...mahals].sort((a,b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const optionsHtml = sortedMahals.map(m=>`<option value="${m.id}" ${values.mahalId === m.id ? 'selected' : ''}>${escapeHTML(m.name)}</option>`).join('');
  
  const div = document.createElement('div');
  div.className = 'unit-row-card';
  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--primary); display:inline-flex; align-items:center; gap:6px; text-transform:uppercase; letter-spacing:0.5px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        Birim Bilgileri
      </span>
      <button type="button" class="remove-btn" onclick="removeUnitRow(this)" style="position:static; margin:0; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; gap:4px; font-size:11px; font-weight:700;" aria-label="Kaldır"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Kaldır</button>
    </div>
    <div style="display:grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px;">
      <div>
        <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">İşveren</label>
        <select class="unit-mahal" onchange="updateReportPreview()" style="width:100%; height:34px; padding:0 8px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text); font-size:12px; font-weight:600;">
          <option value="">İşveren Seçin...</option>
          ${optionsHtml}
        </select>
      </div>
      <div class="grid-2-col" style="display:grid; gap: 12px;">
        <div>
          <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Birim / Bölüm Adı</label>
          <input type="text" class="unit-name" placeholder="Örn: Asma Tavan, Elektrik" value="${escapeHTML(values.birimAdi || '')}" oninput="updateReportPreview()" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">
        </div>
        <div>
          <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Çalışan Ekip / Sayısı</label>
          <input type="text" class="unit-crew" placeholder="Örn: 3 Usta, 2 Yardımcı" value="${escapeHTML(values.ekip || '')}" oninput="updateReportPreview()" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">
        </div>
      </div>
    </div>
    <div class="grid-2-col" style="display:grid; gap: 12px;">
      <div>
        <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Yapılan Faaliyetler</label>
        <textarea class="unit-activity" placeholder="Örn: 2. kat kablolama tamamlandı" oninput="updateReportPreview()" style="width:100%; height:50px; padding:6px; font-size:12px; font-family:inherit; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">${escapeHTML(values.faaliyet || '')}</textarea>
      </div>
      <div>
        <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Kullanılan / Gelen Malzeme</label>
        <textarea class="unit-material" placeholder="Örn: 100m kablo kullanıldı" oninput="updateReportPreview()" style="width:100%; height:50px; padding:6px; font-size:12px; font-family:inherit; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">${escapeHTML(values.malzeme || '')}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
  updateReportPreview();
}

function removeUnitRow(btn) {
  btn.parentElement.remove();
  updateReportPreview();
}

function getReportUnitsData() {
  const container = document.getElementById('reportUnitsContainer');
  if (!container) return [];
  const cards = container.querySelectorAll('.unit-row-card');
  const list = [];
  cards.forEach(card => {
    const mahalSelect = card.querySelector('.unit-mahal');
    const mahalVal = mahalSelect ? mahalSelect.value : '';
    const nameVal = card.querySelector('.unit-name').value.trim();
    const crewVal = card.querySelector('.unit-crew').value.trim();
    const actVal = card.querySelector('.unit-activity').value.trim();
    const matVal = card.querySelector('.unit-material').value.trim();
    if (mahalVal || nameVal || crewVal || actVal || matVal) {
      list.push({
        mahalId: mahalVal,
        birimAdi: nameVal,
        ekip: crewVal,
        faaliyet: actVal,
        malzeme: matVal
      });
    }
  });
  return list;
}

function populateReportMahalDropdown(){
  // Obsolete dropdown but keeping as no-op helper for backwards compatibility
}

function updateReportPreview() {
  const dateInput = document.getElementById('rep_date').value;
  const weatherInput = document.getElementById('rep_weather').value;
  const santiyeInput = document.getElementById('rep_santiye').value;
  const notesInput = document.getElementById('rep_notes').value;
  
  document.getElementById('pdf_tarih').textContent = dateInput ? fmt(dateInput) : '-';
  document.getElementById('pdf_hava').textContent = weatherInput || '-';
  document.getElementById('pdf_santiye').textContent = santiyeInput || '-';
  
  const preparedByName = (currentUser ? (currentUser.name || currentUser.u) : '-') + 
                         (currentUser && currentUser.job ? ` (${currentUser.job})` : '');
  document.getElementById('pdf_prepared_by').textContent = preparedByName;
  document.getElementById('pdf_prepared_by_meta').textContent = preparedByName;
  
  const notesWrap = document.getElementById('pdf_notes_wrap');
  if (notesInput && notesInput.trim()) {
    notesWrap.style.display = 'block';
    document.getElementById('pdf_notes_text').textContent = notesInput;
  } else {
    notesWrap.style.display = 'none';
  }
  
  const units = getReportUnitsData();
  const tableBody = document.getElementById('pdf_table_body');
  if (units.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#94a3b8; padding:30px;">Henüz birim eklenmedi. Sol taraftan "+ Birim Ekle" butonuna basın.</td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = units.map(u => `
      <tr>
        <td style="font-weight:600; color:#475569; font-size:9px;">${escapeHTML(getMahalName(u.mahalId)) || '-'}</td>
        <td style="font-weight:700; color:#0f172a;">${escapeHTML(u.birimAdi) || '-'}</td>
        <td style="font-weight:600; color:#334155;">${escapeHTML(u.ekip) || '-'}</td>
        <td style="white-space:pre-wrap;">${escapeHTML(u.faaliyet) || '-'}</td>
        <td style="white-space:pre-wrap;">${escapeHTML(u.malzeme) || '-'}</td>
      </tr>
    `).join('');
  }
}

function previewReport(id) {
  const r = reports.find(x => x.id === id);
  if (!r) return;
  
  document.getElementById('pdf_tarih').textContent = r.tarih ? fmt(r.tarih) : '-';
  document.getElementById('pdf_hava').textContent = r.hava || '-';
  document.getElementById('pdf_santiye').textContent = r.santiye || '-';
  
  document.getElementById('pdf_prepared_by').textContent = r.yazan || '-';
  document.getElementById('pdf_prepared_by_meta').textContent = r.yazan || '-';
  
  const notesWrap = document.getElementById('pdf_notes_wrap');
  if (r.genelNotlar && r.genelNotlar.trim()) {
    notesWrap.style.display = 'block';
    document.getElementById('pdf_notes_text').textContent = r.genelNotlar;
  } else {
    notesWrap.style.display = 'none';
  }
  
  const units = r.birimler || [];
  const tableBody = document.getElementById('pdf_table_body');
  if (units.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#94a3b8; padding:30px;">Bu raporda kayıtlı birim bulunmuyor.</td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = units.map(u => `
      <tr>
        <td style="font-weight:600; color:#475569; font-size:9px;">${escapeHTML(getMahalName(u.mahalId)) || '-'}</td>
        <td style="font-weight:700; color:#0f172a;">${escapeHTML(u.birimAdi) || '-'}</td>
        <td style="font-weight:600; color:#334155;">${escapeHTML(u.ekip) || '-'}</td>
        <td style="white-space:pre-wrap;">${escapeHTML(u.faaliyet) || '-'}</td>
        <td style="white-space:pre-wrap;">${escapeHTML(u.malzeme) || '-'}</td>
      </tr>
    `).join('');
  }
}

function renderReports() {
  const q = (document.getElementById('srchReport').value || '').toLowerCase();
  
  const repDateInput = document.getElementById('rep_date');
  if (repDateInput && !repDateInput.value) {
    repDateInput.value = today();
  }
  
  const container = document.getElementById('reportUnitsContainer');
  if (container && container.children.length === 0) {
    addUnitRow();
  }
  
  const sortedReports = [...reports].sort((a,b) => {
    const dateA = a.tarih || '';
    const dateB = b.tarih || '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    const timeA = a.createdAt ? (a.createdAt.seconds || 0) : 0;
    const timeB = b.createdAt ? (b.createdAt.seconds || 0) : 0;
    return timeB - timeA;
  });
  
  const filtered = sortedReports.filter(r => {
    const associatedEmployers = r.mahalIds ? r.mahalIds.map(id => getMahalName(id).toLowerCase()).join(' ') : getMahalName(r.mahalId).toLowerCase();
    const santiye = (r.santiye || '').toLowerCase();
    const dateStr = (r.tarih || '');
    const preparedBy = (r.yazan || '').toLowerCase();
    const unitsStr = (r.birimler || []).map(u => u.birimAdi).join(' ').toLowerCase();
    
    return associatedEmployers.includes(q) || santiye.includes(q) || dateStr.includes(q) || preparedBy.includes(q) || unitsStr.includes(q);
  });
  
  const tbody = document.getElementById('reportsTbody');
  const mobList = document.getElementById('mobileReportsWrap');
  if (!tbody && !mobList) return;
  
  if (filtered.length === 0) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color:var(--text3); padding:24px;">Arşive kayıtlı günlük rapor bulunamadı.</td>
        </tr>
      `;
    }
    if (mobList) {
      mobList.innerHTML = `<div style="text-align:center; color:var(--text3); padding:24px;">Arşive kayıtlı günlük rapor bulunamadı.</div>`;
    }
    return;
  }
  
  if (tbody) {
    tbody.innerHTML = filtered.map(r => {
      const formattedDate = fmt(r.tarih);
      const employers = r.mahalIds ? r.mahalIds.map(id => getMahalName(id)).filter(name => name !== 'Tanımlanmamış').join(', ') : getMahalName(r.mahalId);
      const title = r.santiye ? `${r.santiye} / ${employers}` : employers;
      const unitsSummary = (r.birimler || []).map(u => `<span class="badge b-diger" style="margin-right:4px; font-size:10px;">${escapeHTML(u.birimAdi)}</span>`).join('');
      
      return `
        <tr onclick="previewReport('${r.id}')" style="cursor:pointer;" class="clickable-row">
          <td style="font-weight:700;">${formattedDate}</td>
          <td>
            <div style="font-weight:600; color:var(--text);">${escapeHTML(title)}</div>
          </td>
          <td><span style="font-size:12px; color:var(--text2);">${escapeHTML(r.hava) || '-'}</span></td>
          <td><div style="display:flex; flex-wrap:wrap; gap:4px;">${unitsSummary || '<span style="color:var(--text3); font-size:11px;">Birim yok</span>'}</div></td>
          <td><span style="font-size:12px; font-weight:550; color:var(--text2);">${escapeHTML(r.yazan) || '-'}</span></td>
          <td style="text-align:right;" onclick="event.stopPropagation();">
            <div style="display:inline-flex; gap:6px;">
              <button class="tb-btn" onclick="downloadReportPDFDirect('${r.id}')" title="PDF Olarak İndir" style="padding:6px 10px; background:#d97706; color:white; border:none; font-size:12px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>PDF</span>
              </button>
              <button class="btn-edit" onclick="editReport('${r.id}')" title="Raporu Düzenle" style="padding:6px 10px; font-size:12px; display:inline-flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Düzenle</span>
              </button>
              <button class="btn-del" onclick="deleteReport('${r.id}')" title="Raporu Sil" style="padding:6px 10px; font-size:12px; display:inline-flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (mobList) {
    mobList.innerHTML = filtered.map(r => {
      const formattedDate = fmt(r.tarih);
      const employers = r.mahalIds ? r.mahalIds.map(id => getMahalName(id)).filter(name => name !== 'Tanımlanmamış').join(', ') : getMahalName(r.mahalId);
      const title = r.santiye ? `${r.santiye} / ${employers}` : employers;
      const unitsSummary = (r.birimler || []).map(u => `<span class="badge b-diger" style="margin-right:4px; font-size:10px; white-space:nowrap;">${escapeHTML(u.birimAdi)}</span>`).join('');
      
      return `
        <div class="mobile-card" onclick="previewReport('${r.id}')" style="cursor:pointer; padding:14px; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:6px;">
            <span style="font-weight:700; font-size:13px; color:var(--text);">${formattedDate}</span>
            <span style="font-size:11px; color:var(--text2); font-weight:600; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg> ${escapeHTML(r.hava) || '-'}</span>
          </div>
          <div style="font-size:13px; color:var(--text); font-weight:600;">
            Şantiye: <span style="font-weight:500; color:var(--text2);">${escapeHTML(title)}</span>
          </div>
          <div style="font-size:12px; color:var(--text2);">
            Hazırlayan: <span style="font-weight:500; color:var(--text);">${escapeHTML(r.yazan) || '-'}</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:2px;">
            ${unitsSummary || '<span style="color:var(--text3); font-size:11px;">Birim yok</span>'}
          </div>
          <div style="display:flex; gap:8px; margin-top:6px;" onclick="event.stopPropagation();">
            <button class="tb-btn" onclick="downloadReportPDFDirect('${r.id}')" style="padding:6px 10px; flex:1; font-size:12px; background:#d97706; color:white; border:none; display:flex; align-items:center; justify-content:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              PDF İndir
            </button>
            <button class="btn-edit" onclick="editReport('${r.id}')" style="padding:6px 10px; flex:1; font-size:12px; display:flex; align-items:center; justify-content:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Düzenle
            </button>
            <button class="btn-del" onclick="deleteReport('${r.id}')" style="padding:6px 10px; font-size:12px; display:flex; align-items:center; justify-content:center;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

async function saveReport() {
  const dateInput = document.getElementById('rep_date').value;
  const weatherInput = document.getElementById('rep_weather').value;
  const santiyeInput = document.getElementById('rep_santiye').value.trim();
  const notesInput = document.getElementById('rep_notes').value.trim();
  const units = getReportUnitsData();
  
  if (!dateInput) {
    showToast('Lütfen rapor tarihini seçin.', 'error');
    return;
  }
  
  const btn = document.getElementById('btnSaveReport');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Kaydediliyor...';
  
  const uniqueMahalIds = [...new Set(units.map(u => u.mahalId).filter(id => !!id))];
  const primaryMahalId = uniqueMahalIds.length > 0 ? uniqueMahalIds[0] : '';
  
  const data = {
    tarih: dateInput,
    hava: weatherInput.trim(),
    mahalId: primaryMahalId,
    mahalIds: uniqueMahalIds,
    santiye: santiyeInput,
    notes: notesInput,
    birimler: units,
    yazan: currentUser ? (currentUser.name || currentUser.u) : 'Sistem',
    yazanUnvan: currentUser ? (currentUser.job || '') : '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    const localData = { ...data, createdAt: { seconds: Math.floor(Date.now() / 1000) } };
    if (editReportId) {
      await col('reports').doc(editReportId).update(data);
      const idx = reports.findIndex(x => x.id === editReportId);
      if(idx > -1) reports[idx] = {id: editReportId, ...localData};
      showToast('Günlük iş raporu başarıyla güncellendi.', 'success');
    } else {
      const docRef = await col('reports').add(data);
      reports.push({id: docRef.id, ...localData});
      showToast('Günlük iş raporu başarıyla kaydedildi.', 'success');
    }
    
    clearReportForm();
    renderReports();
  } catch(e) {
    console.error("Save report error: ", e);
    showToast('Rapor kaydedilirken hata oluştu.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function editReport(id) {
  const r = reports.find(x => x.id === id);
  if (!r) return;
  
  editReportId = id;
  
  document.getElementById('rep_date').value = r.tarih || '';
  document.getElementById('rep_weather').value = r.hava || '';
  document.getElementById('rep_santiye').value = r.santiye || '';
  document.getElementById('rep_notes').value = r.notes || '';
  
  const container = document.getElementById('reportUnitsContainer');
  if (container) {
    container.innerHTML = '';
    if (r.birimler && r.birimler.length) {
      r.birimler.forEach(u => addUnitRow(u));
    } else {
      addUnitRow();
    }
  }
  
  document.getElementById('reportFormTitleText').textContent = 'Raporu Düzenle';
  document.getElementById('btnResetReport').style.display = 'inline-block';
  document.getElementById('btnSaveReport').textContent = 'Raporu Güncelle';
  
  updateReportPreview();
  showToast('Rapor bilgileri forma yüklendi.', 'info');
}

async function deleteReport(id) {
  const ok = await showConfirm('Raporu Sil', 'Bu günlük raporu silmek istediğinize emin misiniz?', true);
  if (!ok) return;
  
  try {
    await col('reports').doc(id).delete();
    showToast('Rapor başarıyla silindi.', 'success');
    
    reports = reports.filter(r => r.id !== id);
    
    if (editReportId === id) {
      clearReportForm();
    }
    renderReports();
  } catch(e) {
    console.error("Delete report error: ", e);
    showToast('Rapor silinirken hata oluştu.', 'error');
  }
}

function clearReportForm() {
  editReportId = null;
  document.getElementById('rep_date').value = today();
  document.getElementById('rep_weather').value = '';
  document.getElementById('rep_santiye').value = '';
  document.getElementById('rep_notes').value = '';
  
  const container = document.getElementById('reportUnitsContainer');
  if (container) {
    container.innerHTML = '';
    addUnitRow();
  }
  
  document.getElementById('reportFormTitleText').textContent = 'Günlük Rapor Oluştur';
  document.getElementById('btnResetReport').style.display = 'none';
  document.getElementById('btnSaveReport').textContent = 'Raporu Kaydet';
  
  updateReportPreview();
}

function downloadReportPDF() {
  const element = document.getElementById('reportPDFTemplate');
  const dateInput = document.getElementById('rep_date').value || today();
  const filename = `YSR_Gunluk_Rapor_${dateInput}.pdf`;
  
  const opt = {
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
}

function downloadReportPDFDirect(id) {
  const r = reports.find(x => x.id === id);
  if (!r) return;
  
  const oldDate = document.getElementById('rep_date').value;
  const oldWeather = document.getElementById('rep_weather').value;
  const oldSantiye = document.getElementById('rep_santiye').value;
  const oldNotes = document.getElementById('rep_notes').value;
  const oldMahal = document.getElementById('rep_mahal') ? document.getElementById('rep_mahal').value : '';
  
  const container = document.getElementById('reportUnitsContainer');
  const currentUnitsHTML = container ? container.innerHTML : '';
  
  document.getElementById('rep_date').value = r.tarih || '';
  document.getElementById('rep_weather').value = r.hava || '';
  document.getElementById('rep_santiye').value = r.santiye || '';
  document.getElementById('rep_notes').value = r.notes || '';
  if (document.getElementById('rep_mahal')) {
    document.getElementById('rep_mahal').value = r.mahalId || '';
  }
  
  if (container) {
    container.innerHTML = '';
    if (r.birimler) {
      r.birimler.forEach(u => {
        const div = document.createElement('div');
        div.className = 'unit-row-card';
        div.innerHTML = `
          <input type="hidden" class="unit-mahal" value="${escapeHTML(u.mahalId || '')}">
          <input type="text" class="unit-name" value="${escapeHTML(u.birimAdi || '')}">
          <input type="text" class="unit-crew" value="${escapeHTML(u.ekip || '')}">
          <textarea class="unit-activity">${escapeHTML(u.faaliyet || '')}</textarea>
          <textarea class="unit-material">${escapeHTML(u.malzeme || '')}</textarea>
        `;
        container.appendChild(div);
      });
    }
  }
  
  updateReportPreview();
  
  const preparedByName = (r.yazan || '-') + (r.yazanUnvan ? ` (${r.yazanUnvan})` : '');
  document.getElementById('pdf_prepared_by').textContent = preparedByName;
  
  const element = document.getElementById('reportPDFTemplate');
  const filename = `YSR_Gunluk_Rapor_${r.tarih}_${getMahalName(r.mahalId).replace(/\s+/g, '_')}.pdf`;
  
  const opt = {
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save().then(() => {
    try {
      document.getElementById('rep_date').value = oldDate;
      document.getElementById('rep_weather').value = oldWeather;
      document.getElementById('rep_santiye').value = oldSantiye;
      document.getElementById('rep_notes').value = oldNotes;
      if (document.getElementById('rep_mahal')) {
        document.getElementById('rep_mahal').value = oldMahal;
      }
      if (container) container.innerHTML = currentUnitsHTML;
      updateReportPreview();
    } catch (e) {
      console.error("PDF restore error:", e);
    }
  });
}

// ── ANALİZ DEĞERLERİ & GRAFİKLERİ ────────────────────────────────
function renderCharts() {
  if (typeof Chart === 'undefined') {
    document.getElementById('analizStatsGrid').innerHTML = '<div style="color:var(--red); font-weight:600; padding:20px;">Grafik kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.</div>';
    return;
  }

  try {
    const t=items.length;
    const approvedItems = items.filter(i=>['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum));
    const on = approvedItems.length;
    
    const approvalRate = t > 0 ? Math.round((on / t) * 100) : 0;
    const totApproved = approvedItems.reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0);
    const activePipelineVal = items
      .filter(i=>['Onaylandı','İş Yapım Aşamasında'].includes(i.durum))
      .reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0);

    // Calculate segmented sums by currency for Approved (Onaylanan) and Active Pipeline (Aktif Yapım)
    const approvedSums = {
      '₺': approvedItems.filter(i => i.cur === '₺' || !i.cur).reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '$': approvedItems.filter(i => i.cur === '$').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '€': approvedItems.filter(i => i.cur === '€').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0)
    };

    const activeItems = items.filter(i=>['Onaylandı','İş Yapım Aşamasında'].includes(i.durum));
    const activeSums = {
      '₺': activeItems.filter(i => i.cur === '₺' || !i.cur).reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '$': activeItems.filter(i => i.cur === '$').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '€': activeItems.filter(i => i.cur === '€').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0)
    };

    const currencyKeys = ['₺', '$', '€'];
    const curLabelsApproved = { '₺': 'Onaylanan Hacim (₺)', '$': 'Onaylanan Hacim ($)', '€': 'Onaylanan Hacim (€)' };
    const curLabelsActive = { '₺': 'Aktif Yapım Hacmi (₺)', '$': 'Aktif Yapım Hacmi ($)', '€': 'Aktif Yapım Hacmi (€)' };

    const renderApprovedVal = () => {
      const cur = currencyKeys[currentStatCurrencyIdx];
      return `
        <div class="stat-lbl" style="transition: opacity 0.3s ease;">${curLabelsApproved[cur]}</div>
        <div class="stat-val" style="transition: opacity 0.3s ease; color:var(--green);">
          <span>${approvedSums[cur].toLocaleString('tr-TR')}\u00A0${cur}</span>
        </div>`;
    };

    const renderActiveVal = () => {
      const cur = currencyKeys[currentStatCurrencyIdx];
      return `
        <div class="stat-lbl" style="transition: opacity 0.3s ease;">${curLabelsActive[cur]}</div>
        <div class="stat-val" style="transition: opacity 0.3s ease; color:var(--blue);">
          <span>${activeSums[cur].toLocaleString('tr-TR')}\u00A0${cur}</span>
        </div>`;
    };

    document.getElementById('analizStatsGrid').innerHTML = `
      <div class="stat-card clickable" onclick="showStatDetails('approved')">
        <div class="stat-lbl">Onay Oranı (%)</div>
        <div class="stat-val" style="color:var(--primary)">%${approvalRate}</div>
      </div>
      <div class="stat-card clickable" id="analizApprovedCard" style="cursor: pointer; user-select: none;">
        <div id="analizApprovedContent">${renderApprovedVal()}</div>
      </div>
      <div class="stat-card clickable" id="analizActiveCard" style="cursor: pointer; user-select: none;">
        <div id="analizActiveContent">${renderActiveVal()}</div>
      </div>
      <div class="stat-card clickable" onclick="showStatDetails('all')">
        <div class="stat-lbl">Toplam Havuz Sayısı</div>
        <div class="stat-val">${t} adet</div>
      </div>`;

    // Connect event bindings for the Analiz page statistical cards
    const apCard = document.getElementById('analizApprovedCard');
    const acCard = document.getElementById('analizActiveCard');
    
    const cycleAnalizCurrencies = (dir = 1) => {
      const apContent = document.getElementById('analizApprovedContent');
      const acContent = document.getElementById('analizActiveContent');
      if (apContent && acContent) {
        apContent.style.opacity = '0';
        apContent.style.transform = 'translateY(3px)';
        acContent.style.opacity = '0';
        acContent.style.transform = 'translateY(3px)';
        
        setTimeout(() => {
          apContent.innerHTML = renderApprovedVal();
          acContent.innerHTML = renderActiveVal();
          
          apContent.style.opacity = '1';
          apContent.style.transform = 'translateY(0)';
          acContent.style.opacity = '1';
          acContent.style.transform = 'translateY(0)';
        }, 180);
      }
    };

    const triggerManualAnalizCycle = (dir = 1) => {
      currentStatCurrencyIdx = (currentStatCurrencyIdx + dir + 3) % 3;
      cycleAnalizCurrencies(dir);
      
      // Update main statistics card index to match consistently
      if (typeof updateStats === 'function') {
        updateStats();
      }
    };

    if (apCard && acCard) {
      apCard.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerManualAnalizCycle(1);
      });
      acCard.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerManualAnalizCycle(1);
      });

      apCard.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        triggerManualAnalizCycle(e.deltaY > 0 ? 1 : -1);
      }, { passive: false });
      acCard.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        triggerManualAnalizCycle(e.deltaY > 0 ? 1 : -1);
      }, { passive: false });
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const gridColor = isDark ? 'rgba(248, 250, 252, 0.1)' : 'rgba(15, 23, 42, 0.08)';

    const categories = ['İnşaat', 'Mekanik', 'Elektrik', 'Diğer'];
    const catCounts = categories.map(cat => items.filter(it => it.kat === cat).length);
    
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    if (catChartInstance) catChartInstance.destroy();
    
    catChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: catCounts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(148, 163, 184, 0.75)'
          ],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, item) => {
          const points = catChartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
          const activePoints = points.length ? points : item;
          if (activePoints && activePoints.length > 0) {
            const index = activePoints[0].index;
            const categoryName = categories[index];
            showStatDetails('category_' + categoryName);
          }
        },
        onHover: (evt, activeElements) => {
          if (evt.native && evt.native.target) {
            evt.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          }
        }
      }
    });

    // Segment data by currency and status for a clean dynamic stacked bar chart
    const currencies = ['₺', '$', '€'];
    const curLabels = { '₺': 'TL (₺)', '$': 'USD ($)', '€': 'EUR (€)' };
    const curColors = {
      '₺': { fill: 'rgba(99, 102, 241, 0.8)', border: 'rgba(99, 102, 241, 1)' },
      '$': { fill: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
      '€': { fill: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' }
    };

    const datasets = currencies.map(cur => {
      const data = STAT_NAMES.map(stat => {
        return items
          .filter(it => it.durum === stat && (it.cur === cur || (!it.cur && cur === '₺')))
          .reduce((sum, it) => sum + (Number(it.ttut || 0)), 0);
      });
      return {
        label: curLabels[cur],
        data: data,
        backgroundColor: curColors[cur].fill,
        borderColor: curColors[cur].border,
        borderWidth: 1.5,
        borderRadius: 6
      };
    });

    const ctxStat = document.getElementById('statusChart').getContext('2d');
    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(ctxStat, {
      type: 'bar',
      data: {
        labels: STAT_NAMES,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, item) => {
          const points = statusChartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
          const activePoints = points.length ? points : item;
          if (activePoints && activePoints.length > 0) {
            const index = activePoints[0].index;
            const statusName = STAT_NAMES[index];
            showStatDetails('status_' + statusName);
          }
        },
        onHover: (evt, activeElements) => {
          if (evt.native && evt.native.target) {
            evt.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const label = context.dataset.label.split(' ')[0];
                const symbol = label === 'TL' ? '₺' : (label === 'USD' ? '$' : '€');
                return `${context.dataset.label}: ${val.toLocaleString('tr-TR')} ${symbol}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          }
        }
      }
    });

    // 2. Mahal ve Kategori Matrisi (Stacked Bar Chart in TL)
    const mNames = mahals.map(m => m.name);
    const getTlVal = (it) => {
      const val = Number(it.ttut) || 0;
      if (it.cur === '$') return val * 32.5;
      if (it.cur === '€') return val * 35.2;
      return val;
    };
    
    const catDatasets = categories.map((cat, catIdx) => {
      const data = mahals.map(m => {
        return items
          .filter(it => it.mahalId === m.id && it.kat === cat)
          .reduce((sum, it) => sum + getTlVal(it), 0);
      });
      
      const catColors = [
        'rgba(59, 130, 246, 0.75)',
        'rgba(16, 185, 129, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(148, 163, 184, 0.75)'
      ];
      
      return {
        label: cat,
        data: data,
        backgroundColor: catColors[catIdx],
        borderColor: isDark ? '#111827' : '#ffffff',
        borderWidth: 1,
        borderRadius: 4
      };
    });

    const ctxMahalCat = document.getElementById('mahalCategoryChart').getContext('2d');
    if (mahalCategoryChartInstance) mahalCategoryChartInstance.destroy();
    mahalCategoryChartInstance = new Chart(ctxMahalCat, {
      type: 'bar',
      data: {
        labels: mNames.length ? mNames : ['Mahal Yok'],
        datasets: catDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${Math.round(context.raw).toLocaleString('tr-TR')} ₺`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          }
        }
      }
    });

    // 3. Dönemsel Teklif Trendi (Line Chart - Last 6 Months)
    const monthNamesTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const getMonthLabel = (dateStr) => {
      if (!dateStr) return '';
      const pts = dateStr.split('-');
      if (pts.length < 2) return '';
      const y = pts[0].substring(2);
      const m = parseInt(pts[1], 10) - 1;
      return `${monthNamesTr[m]} '${y}`;
    };

    // Calculate month counts dynamically
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      last6Months.push({ key: `${y}-${m}`, label: `${monthNamesTr[d.getMonth()]} '${String(y).substring(2)}` });
    }

    const trendData = last6Months.map(mObj => {
      return items.filter(it => it.ttar && it.ttar.startsWith(mObj.key)).length;
    });

    const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
    if (monthlyTrendChartInstance) monthlyTrendChartInstance.destroy();
    monthlyTrendChartInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: last6Months.map(m => m.label),
        datasets: [{
          label: 'Aylık Teklif Adedi',
          data: trendData,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Teklif Sayısı: ${context.raw} adet`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { 
              precision: 0,
              color: textColor, 
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } 
            }
          }
        }
      }
    });

    // 4. Kategori Bazlı Teklif Kazanma / Onay Oranları (Horizontal Bar Chart)
    const winRates = categories.map(cat => {
      const catItems = items.filter(it => it.kat === cat);
      if (!catItems.length) return 0;
      const approvedCount = catItems.filter(it => ['Onaylandı', 'İş Yapım Aşamasında', 'Tamamlandı', 'Faturalandı'].includes(it.durum)).length;
      return Math.round((approvedCount / catItems.length) * 100);
    });

    const ctxConv = document.getElementById('conversionChart').getContext('2d');
    if (conversionChartInstance) conversionChartInstance.destroy();
    conversionChartInstance = new Chart(ctxConv, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Kazanma Oranı (%)',
          data: winRates,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(148, 163, 184, 0.8)'
          ],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Başarı Oranı: %${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { 
              callback: value => `%${value}`,
              color: textColor, 
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } 
            }
          },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          }
        }
      }
    });
  } catch(err) {
    console.error("Grafik yükleme hatası: ", err);
  }
}

// PDF Generation Module
window.generatePDF = async function(itemId) {
  if (!window.jspdf || !window.html2canvas) {
    alert("PDF kütüphaneleri yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
    return;
  }
  
  const it = (typeof items !== 'undefined' ? items : []).find(i => i.id === itemId);
  if (!it) {
    alert("Teklif bulunamadı.");
    return;
  }

  // Show loading indicator
  const loading = document.createElement('div');
  loading.style.position = 'fixed';
  loading.style.top = '0'; loading.style.left = '0';
  loading.style.width = '100%'; loading.style.height = '100%';
  loading.style.background = 'rgba(0,0,0,0.8)';
  loading.style.color = '#fff';
  loading.style.display = 'flex';
  loading.style.alignItems = 'center';
  loading.style.justifyContent = 'center';
  loading.style.zIndex = '99999';
  loading.style.fontSize = '20px';
  loading.style.fontWeight = 'bold';
  loading.innerText = 'PDF Hazırlanıyor... Lütfen Bekleyin.';
  document.body.appendChild(loading);

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Create a hidden div to render the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.background = '#ffffff';
    container.style.color = '#1e293b';
    container.style.fontFamily = 'sans-serif';
    
    const cur = it.cur || '₺';
    const customerName = typeof getMahalName === 'function' ? getMahalName(it.mahalId) : (it.mahal || '-');
    const jobDescription = it.otel || it.santiye || '-';
    
    container.innerHTML = `
      <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin:0; font-size: 32px; color: #1e293b;">YSR CONSTRUCTION</h1>
          <div style="color: #64748b; font-size: 14px; margin-top: 5px;">Teklif Takip & Yönetim Sistemi</div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin:0; font-size: 24px; color: #4f46e5;">TEKLİF FORMU</h2>
          <div style="color: #64748b; margin-top: 5px;">Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
          <div style="color: #64748b;">Ref No: ${it.id.substring(0,8).toUpperCase()}</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin-top:0; color: #334155; font-size: 14px; text-transform: uppercase;">Müşteri / İşveren</h3>
          <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${escapeHTML(customerName)}</div>
          <div style="margin-top: 5px; color: #475569;">Otel/Şantiye: ${escapeHTML(it.otel || '-')}</div>
        </div>
        <div style="width: 48%; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin-top:0; color: #334155; font-size: 14px; text-transform: uppercase;">İş Tanımı</h3>
          <div style="font-size: 16px; font-weight: bold; color: #0f172a;">${escapeHTML(jobDescription)}</div>
          <div style="margin-top: 5px; color: #475569;">Durum: <span style="font-weight:bold; color: #4f46e5;">${it.durum || '-'}</span></div>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 12px 15px; border-bottom: 2px solid #cbd5e1; color: #475569;">Açıklama</th>
            <th style="padding: 12px 15px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Teklif Edilen Tutar</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px;">${fmtN(it.ttut, cur)}</td>
          </tr>
          ${it.otut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #10b981;">Onaylanan Tutar</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #10b981;">${fmtN(it.otut, cur)}</td>
          </tr>` : ''}
          ${it.htut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #8b5cf6;">Hakediş Tutarı</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #8b5cf6;">${fmtN(it.htut, cur)}</td>
          </tr>` : ''}
          ${it.ftut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #3b82f6;">Fatura Tutarı</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #3b82f6;">${fmtN(it.ftut, cur)}</td>
          </tr>` : ''}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Teklif Tarihi</div>
          <div style="font-weight: bold;">${it.ttar || '-'}</div>
        </div>
        <div style="width: 48%;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Başlangıç - Bitiş</div>
          <div style="font-weight: bold;">${it.bas || '-'} / ${it.bit || '-'}</div>
        </div>
      </div>
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        Bu belge YSR Teklif Takip sistemi tarafından otomatik olarak oluşturulmuştur.<br>
        © ${new Date().getFullYear()} YSR Construction
      </div>
    `;
    
    document.body.appendChild(container);
    
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`Teklif_${it.otel || 'İsimsiz'}_${it.id.substring(0,4)}.pdf`);
    
    document.body.removeChild(container);
    
    // Log the action
    if (window.logAction) {
      window.logAction("Hızlı İşlem", "Teklif", it.id, "PDF Çıktısı Alındı");
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("PDF oluşturulurken bir hata oluştu.");
  } finally {
    if (loading && loading.parentNode) {
      document.body.removeChild(loading);
    }
  }
};


// js/logs.js

// ── İşlem Geçmişi (Audit Logs) ─────────────────────────────────────────────
// Firebase üzerinden log kaydetme ve okuma işlemleri

const LOGS_COLLECTION = 'logs';

/**
 * Yeni bir işlem logu kaydeder
 * @param {string} actionType - 'Ekleme', 'Güncelleme', 'Silme', 'Hızlı İşlem' vs.
 * @param {string} entity - Etkilenen obje ismi (Örn: 'Teklif', 'İşveren', 'Rapor')
 * @param {string} docId - İlgili dokümanın ID'si
 * @param {string} details - İşlem detayları (Örn: 'A Şantiyesi için teklif eklendi')
 */
function logAction(actionType, entity, docId, details) {
  if (!db) {
    console.warn("DB bağlantısı yok, log kaydedilemedi.");
    return;
  }
  
  const user = typeof currentUser !== 'undefined' ? currentUser : null;
  const userEmail = user ? (user.u || 'Bilinmeyen Kullanıcı') : 'Bilinmeyen Kullanıcı';
  
  db.collection(LOGS_COLLECTION).add({
    actionType: actionType,
    entity: entity,
    docId: docId || '',
    details: details || '',
    user: userEmail,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    console.error("Log kaydetme hatası:", err);
  });
}

/**
 * Logları UI'da göstermek için (Son Hareketler sayfası)
 */
function renderLogs() {
  const tbody = document.getElementById('logsTbody');
  const mobList = document.getElementById('mobileLogsWrap');
  if (!tbody && !mobList) return;

  if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Yükleniyor...</td></tr>';
  if (mobList) mobList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text2);">Yükleniyor...</div>';

  // Clean up any existing logs listener to prevent memory leaks
  if (window.activeListeners && typeof window.activeListeners.logs === 'function') {
    try { window.activeListeners.logs(); } catch(e){}
  }

  const unsubscribe = db.collection(LOGS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      if (tbody) tbody.innerHTML = '';
      if (mobList) mobList.innerHTML = '';
      
      if (snapshot.empty) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Henüz bir hareket bulunmuyor.</td></tr>';
        if (mobList) mobList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text2);">Henüz bir hareket bulunmuyor.</div>';
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        let dateStr = '-';
        if (data.createdAt) {
          const d = data.createdAt.toDate();
          dateStr = d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }

        let badgeClass = 'status-default';
        let actionLabel = data.actionType || 'İşlem';
        
        if (actionLabel.toLowerCase().includes('ekle')) badgeClass = 'status-gonderilecek';
        if (actionLabel.toLowerCase().includes('güncel')) badgeClass = 'status-onaylandi';
        if (actionLabel.toLowerCase().includes('sil')) badgeClass = 'status-reddedildi';
        if (actionLabel.toLowerCase().includes('hızlı')) badgeClass = 'status-tamamlandi';

        if (tbody) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><div class="cell-text" style="font-weight:600; color:var(--text);">${escapeHTML(dateStr)}</div></td>
            <td><div class="cell-text">${escapeHTML(data.user)}</div></td>
            <td><span class="status-badge ${badgeClass}">${escapeHTML(actionLabel)}</span></td>
            <td>
              <div class="cell-text" style="color:var(--text); font-weight:500;">[${escapeHTML(data.entity)}]</div>
              <div class="cell-sub" style="margin-top:4px;">${escapeHTML(data.details)}</div>
            </td>
          `;
          tbody.appendChild(tr);
        }

        if (mobList) {
          const card = document.createElement('div');
          card.className = 'mobile-card';
          card.style.padding = '14px';
          card.style.gap = '8px';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:6px;">
              <span class="status-badge ${badgeClass}" style="font-size:10px; padding:2px 6px;">${escapeHTML(actionLabel)}</span>
              <span style="font-size:11px; color:var(--text2); font-weight:600;">${escapeHTML(dateStr)}</span>
            </div>
            <div style="font-size:13px; color:var(--text); font-weight:600;">
              [${escapeHTML(data.entity)}] <span style="font-weight:400; color:var(--text2);">${escapeHTML(data.user)}</span>
            </div>
            <div style="font-size:12px; color:var(--text2); margin-top:2px;">
              ${escapeHTML(data.details)}
            </div>
          `;
          mobList.appendChild(card);
        }
      });
    }, err => {
      console.error("Loglar okunurken hata:", err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red; padding:20px;">Loglar yüklenirken bir hata oluştu.</td></tr>';
      if (mobList) mobList.innerHTML = '<div style="text-align:center; color:red; padding:20px;">Loglar yüklenirken bir hata oluştu.</div>';
    });

  if (window.activeListeners) {
    window.activeListeners.logs = unsubscribe;
  }
}


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
let tiltRAF = null;

function documentTiltMove(e) {
  if (energyMode === 'enabled') return;
  if (tiltRAF) cancelAnimationFrame(tiltRAF);
  
  tiltRAF = requestAnimationFrame(() => {
    const card = e.target.closest('.stat-card, .chart-card, .panel-card');
    
    if (!card) {
      if (activeTiltCard) {
        activeTiltCard.style.transform = '';
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
    
    // Custom extreme tilt bounds (gentle 6deg max for premium feel)
    const rotateX = ((yc - y) / yc) * 6;
    const rotateY = ((x - xc) / xc) * 6;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    card.style.boxShadow = `0 12px 24px rgba(99, 102, 241, 0.15), 0 0 20px rgba(167, 139, 250, 0.1)`;
  });
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
  initCalmUI();
  
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
          
          // Load all database collections only after verifying user credentials
          await loadAll();
          
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

window.addEventListener('scroll', () => {
  const topbar = document.querySelector('.topbar');
  const tabsEl = document.getElementById('tabsEl');
  if (topbar && tabsEl) {
    const tabsRect = tabsEl.getBoundingClientRect();
    const topbarRect = topbar.getBoundingClientRect();
    // Trigger when the bottom of tabsEl starts going under the topbar
    if (tabsRect.bottom <= topbarRect.bottom + 10) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  }
});

function toggleCalmUI() {
  const isCalm = document.body.classList.toggle('calm-ui');
  localStorage.setItem('calmUI', isCalm ? 'enabled' : 'disabled');
  
  if (isCalm) {
    if (typeof showToast === 'function') {
      showToast('Sakin Arayüz (Odak Modu) Aktif', 'info');
    }
  } else {
    // Flush queued toasts when exiting Focus Mode
    if (window.calmToastQueue && window.calmToastQueue.length > 0) {
      const q = window.calmToastQueue;
      window.calmToastQueue = [];
      if (typeof updateCalmBadge === 'function') updateCalmBadge();
      
      // Show a summary of notifications missed
      if (typeof showToast === 'function') {
        showToast(`Odak modunda ${q.length} bildirim birikti:`, 'info');
        q.forEach((item, idx) => {
          setTimeout(() => {
            showToast(item.message, item.type);
          }, (idx + 1) * 300);
        });
      }
    } else {
      if (typeof showToast === 'function') {
        showToast('Sakin Arayüz Kapatıldı', 'info');
      }
    }
  }
  updateCalmUIBtnState(isCalm);
}

function updateCalmUIBtnState(isCalm) {
  const btn = document.getElementById('calmToggleBtn');
  if (btn) {
    if (isCalm) {
      btn.style.color = '#ffffff';
      btn.style.background = 'var(--primary)';
      btn.style.borderColor = 'var(--primary)';
    } else {
      btn.style.color = '';
      btn.style.background = '';
      btn.style.borderColor = '';
    }
  }
}

function initCalmUI() {
  const saved = localStorage.getItem('calmUI') || 'disabled';
  const isCalm = saved === 'enabled';
  if (isCalm) {
    document.body.classList.add('calm-ui');
  } else {
    document.body.classList.remove('calm-ui');
  }
  updateCalmUIBtnState(isCalm);
}

/* Global Exports for HTML inline event handlers */
window.shakeElement = shakeElement;
window.getRelativeTime = getRelativeTime;
window.escapeHTML = escapeHTML;
window.escapeJS = escapeJS;
window.setupSnapshot = setupSnapshot;
window.loadAll = loadAll;
window.sha256 = sha256;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
window.updateCalmBadge = updateCalmBadge;
window.unsubscribeAll = unsubscribeAll;
window.getFormState = getFormState;
window.triggerConfetti = triggerConfetti;
window.showAlertModal = showAlertModal;
window.closeAlertModal = closeAlertModal;
window.buildTabs = buildTabs;
window.showTab = showTab;
window.populateMahalFilter = populateMahalFilter;
window.populateModalMahal = populateModalMahal;
window.filterByMahal = filterByMahal;
window.renderMahalPanel = renderMahalPanel;
window.editMahal = editMahal;
window.addMahal = addMahal;
window.delMahal = delMahal;
window.renderAdminPanel = renderAdminPanel;
window.openUserEditModal = openUserEditModal;
window.closeUserEditModal = closeUserEditModal;
window.saveUserEdit = saveUserEdit;
window.addUser = addUser;
window.delUser = delUser;
window.changePass = changePass;
window.handleSort = handleSort;
window.updateSortHeadersUI = updateSortHeadersUI;
window.getStepperHtml = getStepperHtml;
window.getMahalName = getMahalName;
window.getUserDisplayName = getUserDisplayName;
window.render = render;
window.updateStats = updateStats;
window.checkOverdue = checkOverdue;
window.openModal = openModal;
window.closeModal = closeModal;
window.updateCur2Lbl = updateCur2Lbl;
window.toggleNewMahal = toggleNewMahal;
window.onMahalSel = onMahalSel;
window.addMahalFromModal = addMahalFromModal;
window.handleFileUpload = handleFileUpload;
window.removeAttachedFile = removeAttachedFile;
window.saveItem = saveItem;
window.quickAddSave = quickAddSave;
window.delItem = delItem;
window.quickAction = quickAction;
window.closeApproveModal = closeApproveModal;
window.quickApprove = quickApprove;
window.closeHakedisModal = closeHakedisModal;
window.openHakedisModal = openHakedisModal;
window.toggleAccordion = toggleAccordion;
window.resetModalAccordions = resetModalAccordions;
window.closeInvoiceModal = closeInvoiceModal;
window.openInvoiceModal = openInvoiceModal;
window.exportExcel = exportExcel;
window.goBackFromStats = goBackFromStats;
window.showStatDetails = showStatDetails;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.manualSaveProfile = manualSaveProfile;
window.saveProfile = saveProfile;
window.loadProfile = loadProfile;
window.updateProfileUI = updateProfileUI;
window.changeAccentColor = changeAccentColor;
window.updateUserPresence = updateUserPresence;
window.startPresenceHeartbeat = startPresenceHeartbeat;
window.stopPresenceHeartbeat = stopPresenceHeartbeat;
window.renderKesif = renderKesif;
window.getUserSelectOptions = getUserSelectOptions;
window.getTaseronSelectOptions = getTaseronSelectOptions;
window.getSurveySelectOptions = getSurveySelectOptions;
window.renderTodoList = renderTodoList;
window.updateTodoState = updateTodoState;
window.openTodoModal = openTodoModal;
window.closeTodoModal = closeTodoModal;
window.saveTodoItem = saveTodoItem;
window.deleteTodoItem = deleteTodoItem;
window.openKesifModal = openKesifModal;
window.closeKesifModal = closeKesifModal;
window.saveKesif = saveKesif;
window.delKesif = delKesif;
window.convertToProposal = convertToProposal;
window.renderTaseron = renderTaseron;
window.calculateTaseronBalance = calculateTaseronBalance;
window.renderTaseronList = renderTaseronList;
window.selectTaseron = selectTaseron;
window.addTaseron = addTaseron;
window.updateTaseronJob = updateTaseronJob;
window.renderTaseronCari = renderTaseronCari;
window.addPayment = addPayment;
window.deleteTaseron = deleteTaseron;
window.delPayment = delPayment;
window.getSurveyDropdownOptions = getSurveyDropdownOptions;
window.getUsersDropdownOptions = getUsersDropdownOptions;
window.addTaseronManualJob = addTaseronManualJob;
window.addUnitRow = addUnitRow;
window.removeUnitRow = removeUnitRow;
window.getReportUnitsData = getReportUnitsData;
window.populateReportMahalDropdown = populateReportMahalDropdown;
window.updateReportPreview = updateReportPreview;
window.previewReport = previewReport;
window.renderReports = renderReports;
window.saveReport = saveReport;
window.editReport = editReport;
window.deleteReport = deleteReport;
window.clearReportForm = clearReportForm;
window.downloadReportPDF = downloadReportPDF;
window.downloadReportPDFDirect = downloadReportPDFDirect;
window.renderCharts = renderCharts;
window.logAction = logAction;
window.renderLogs = renderLogs;
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.initTheme = initTheme;
window.initEnergyMode = initEnergyMode;
window.toggleEnergyMode = toggleEnergyMode;
window.initAuroraEffect = initAuroraEffect;
window.stopAuroraEffect = stopAuroraEffect;
window.auroraLoop = auroraLoop;
window.extremeMouseMove = extremeMouseMove;
window.extremeMouseLeave = extremeMouseLeave;
window.documentTiltMove = documentTiltMove;
window.bindExtremeEvents = bindExtremeEvents;
window.unbindExtremeEvents = unbindExtremeEvents;
window.safeListen = safeListen;
window.updateOnlineStatus = updateOnlineStatus;
window.toggleCalmUI = toggleCalmUI;
window.updateCalmUIBtnState = updateCalmUIBtnState;
window.initCalmUI = initCalmUI;