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
      <td><span class="mahal-tag">${getMahalName(it.mahalId)}</span></td>
      <td style="font-weight:700;">${it.santiye || it.otel || '-'}</td>
      <td><span class="badge ${CAT_CLS[it.kat]||'b-diger'}">${it.kat||'-'}</span></td>
      <td>${fmt(it.ktar)}</td>
      <td style="font-weight:600;">${it.sorumlu||'-'}</td>
      <td><span class="badge ${statusClass}">${it.durum||'-'}</span></td>
      <td style="max-width:200px; white-space:normal; font-size:12px; color:var(--text2);">${it.notlar||'-'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          ${convertBtn}
          <button class="btn-edit" style="padding:6px 8px; border-radius:6px;" onclick="openKesifModal('${it.id}')" aria-label="Düzenle">✏️</button>
          <button class="btn-del" style="padding:6px 8px; border-radius:6px;" onclick="delKesif('${it.id}')" aria-label="Sil">🗑️</button>
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
            <div class="mobile-card-title">${it.santiye || it.otel || '-'}</div>
            <div class="mobile-card-tags" style="margin-top:6px;">
              <span class="mahal-tag">${getMahalName(it.mahalId)}</span>
              <span class="badge ${CAT_CLS[it.kat]||'b-diger'}">${it.kat||'-'}</span>
            </div>
          </div>
          <span class="badge ${statusClass}" style="font-size:11px; padding:4px 8px;">${it.durum||'-'}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; border-bottom: 1px dashed var(--border); padding-bottom:10px; margin-bottom:10px;">
          <div><span style="color:var(--text2)">Keşif Tarihi:</span> ${fmt(it.ktar)}</div>
          <div><span style="color:var(--text2)">Sorumlu Mühendis:</span> ${it.sorumlu||'-'}</div>
          <div style="margin-top:4px; color:var(--text2); font-style:italic;">${it.notlar||'-'}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:6px; width: 100%;">
            <button class="btn-edit" style="padding:6px 10px; flex:1;" onclick="openKesifModal('${it.id}')">✏️ Düzenle</button>
            <button class="btn-del" style="padding:6px 10px; flex:1;" onclick="delKesif('${it.id}')">🗑️ Sil</button>
          </div>
        </div>
        ${convertBtn}
      </div>`;
    }).join('');
  }
}

function openKesifModal(id){
  editKesifId = id;
  const isEdit = (id !== null);
  document.getElementById('kesifModalTitle').textContent = isEdit ? 'Keşif Düzenle' : 'Yeni Keşif Ekle';
  document.getElementById('saveKesifBtn').textContent = isEdit ? 'Güncelle' : 'Kaydet';
  
  // Populate mahal dropdown
  const sel = document.getElementById('fk_mahal');
  const sortedMahals = [...mahals].sort((a,b) => a.name.localeCompare(b.name, 'tr'));
  sel.innerHTML = '<option value="">— işveren seçin —</option>' + sortedMahals.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  
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
    document.getElementById('fk_kat').value = 'İnşaat';
    document.getElementById('fk_durum').value = 'Keşif Bekliyor';
    document.getElementById('fk_ktar').value = today();
    document.getElementById('fk_sorumlu').value = '';
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
    
    const data = {
      mahalId,
      otel,
      santiye: otel,
      kat,
      durum,
      ktar,
      sorumlu,
      notlar,
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