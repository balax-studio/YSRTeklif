// ── Firebase init ─────────────────────────────────────────────
let db, storage;
try {
  if (!window.FIREBASE_CONFIG) {
    throw new Error("window.FIREBASE_CONFIG global değişkeni tanımlı değil.");
  }
  firebase.initializeApp(window.FIREBASE_CONFIG);
  db = firebase.firestore();
  storage = firebase.storage();
} catch(e) {
  console.error("Firebase Initialization Error:", e);
  window.FIREBASE_INIT_ERROR = e.message;
}

// ── State ─────────────────────────────────────────────────────
let items=[], mahals=[], users=[], surveys=[], reports=[], currentUser=null, editIdx=-1, sortKey='ttar', sortDir='desc', editKesifId=null, convertingSurveyId=null, editUserId=null, editReportId=null;
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

function setupSnapshot(colName, orderByField, orderByDir, onUpdate) {
  return new Promise((resolve, reject) => {
    let query = col(colName);
    if (orderByField) query = query.orderBy(orderByField, orderByDir);
    let isFirst = true;
    query.onSnapshot(snap => {
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
  });
}

async function loadAll(){
  try {
    const uSnap = await col('users').get();
    users = uSnap.docs.map(d=>({id:d.id,...d.data()}));
    
    if(!users.length){
      const passAdmin = await sha256('ysr2024');
      const passUser = await sha256('ysr123');
      await col('users').add({u:'admin',p:passAdmin,r:'admin'});
      await col('users').add({u:'ysr',p:passUser,r:'user'});
      const snap2 = await col('users').get();
      users = snap2.docs.map(d=>({id:d.id,...d.data()}));
    }
    
    await Promise.all([
      setupSnapshot('mahals', 'name', 'asc', d => { mahals = d; }),
      setupSnapshot('items', 'createdAt', 'desc', d => { items = d; }),
      setupSnapshot('surveys', null, null, d => { surveys = d; }),
      setupSnapshot('reports', null, null, d => { reports = d; })
    ]);
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
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  if (type === 'success') icon = '🟢';
  else if (type === 'error') icon = '🔴';
  else icon = '🔵';
  
  toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${message}</span>`;
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