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