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
        // Trigger UI updates safely if the functions exist
        if (typeof render === 'function') {
          try { render(); updateStats(); checkOverdue(); } catch(e){}
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
        if (typeof renderKesifler === 'function') {
           try { renderKesifler(); } catch(e){}
        }
        if (typeof renderReports === 'function') {
           try { renderReports(); } catch(e){}
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
      setupSnapshot('reports', null, null, d => { reports = d; })
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