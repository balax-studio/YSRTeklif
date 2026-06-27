// ── Günlük İş Raporları (Daily Work Reports) ───────────────────
function addUnitRow(values = { birimAdi: '', ekip: '', faaliyet: '', malzeme: '', mahalId: '' }) {
  const container = document.getElementById('reportUnitsContainer');
  if (!container) return;
  
  const sortedMahals = [...mahals].sort((a,b) => a.name.localeCompare(b.name, 'tr'));
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
          <input type="text" class="unit-name" placeholder="Örn: Asma Tavan, Elektrik" value="${values.birimAdi || ''}" oninput="updateReportPreview()" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">
        </div>
        <div>
          <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Çalışan Ekip / Sayısı</label>
          <input type="text" class="unit-crew" placeholder="Örn: 3 Usta, 2 Yardımcı" value="${values.ekip || ''}" oninput="updateReportPreview()" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">
        </div>
      </div>
    </div>
    <div class="grid-2-col" style="display:grid; gap: 12px;">
      <div>
        <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Yapılan Faaliyetler</label>
        <textarea class="unit-activity" placeholder="Örn: 2. kat kablolama tamamlandı" oninput="updateReportPreview()" style="width:100%; height:50px; padding:6px; font-size:12px; font-family:inherit; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">${values.faaliyet || ''}</textarea>
      </div>
      <div>
        <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text)">Kullanılan / Gelen Malzeme</label>
        <textarea class="unit-material" placeholder="Örn: 100m kablo kullanıldı" oninput="updateReportPreview()" style="width:100%; height:50px; padding:6px; font-size:12px; font-family:inherit; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);">${values.malzeme || ''}</textarea>
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
            <span style="font-size:11px; color:var(--text2); font-weight:600;">☁️ ${escapeHTML(r.hava) || '-'}</span>
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
  btn.innerHTML = '⚡ Kaydediliyor...';
  
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
  
  const container = document.getElementById('reportUnitsContainer');
  const currentUnitsHTML = container ? container.innerHTML : '';
  
  document.getElementById('rep_date').value = r.tarih || '';
  document.getElementById('rep_weather').value = r.hava || '';
  document.getElementById('rep_santiye').value = r.santiye || '';
  document.getElementById('rep_notes').value = r.notes || '';
  
  if (container) {
    container.innerHTML = '';
    if (r.birimler) {
      r.birimler.forEach(u => {
        const div = document.createElement('div');
        div.className = 'unit-row-card';
        div.innerHTML = `
          <input type="text" class="unit-name" value="${u.birimAdi || ''}">
          <input type="text" class="unit-crew" value="${u.ekip || ''}">
          <textarea class="unit-activity">${u.faaliyet || ''}</textarea>
          <textarea class="unit-material">${u.malzeme || ''}</textarea>
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
    document.getElementById('rep_date').value = oldDate;
    document.getElementById('rep_weather').value = oldWeather;
    document.getElementById('rep_mahalId').value = oldMahal;
    document.getElementById('rep_santiye').value = oldSantiye;
    document.getElementById('rep_notes').value = oldNotes;
    if (container) container.innerHTML = currentUnitsHTML;
    updateReportPreview();
  });
}