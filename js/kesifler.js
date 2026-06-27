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