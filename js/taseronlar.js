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

