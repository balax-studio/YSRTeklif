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
