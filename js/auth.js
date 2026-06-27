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
    await loadAll();
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
      return;
    }
    
    currentUser=found;
    loginErr.textContent='';
    
    // Subscribe to users collection only if user has admin role
    if (currentUser.r === 'admin') {
      await setupSnapshot('users', null, null, d => { users = d; });
    }
    
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