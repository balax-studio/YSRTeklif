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
  
  const user = firebase.auth().currentUser;
  const userEmail = user ? user.email : 'Bilinmeyen Kullanıcı';
  
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
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Yükleniyor...</td></tr>';

  db.collection(LOGS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      tbody.innerHTML = '';
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Henüz bir hareket bulunmuyor.</td></tr>';
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

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><div class="cell-text" style="font-weight:600; color:var(--text);">${dateStr}</div></td>
          <td><div class="cell-text">${data.user}</div></td>
          <td><span class="status-badge ${badgeClass}">${actionLabel}</span></td>
          <td>
            <div class="cell-text" style="color:var(--text); font-weight:500;">[${data.entity}]</div>
            <div class="cell-sub" style="margin-top:4px;">${data.details}</div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }, err => {
      console.error("Loglar okunurken hata:", err);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red; padding:20px;">Loglar yüklenirken bir hata oluştu.</td></tr>';
    });
}
