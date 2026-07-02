# Keşifler TODO Entegrasyonu ve Taşeron Cari Sayfası Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keşifler sayfasına alt TODO listesi eklemek, yeni bir Taşeronlar sayfası oluşturmak ve cariler ile ödemeleri entegre ederek mobil uyumlu bir takip modülü geliştirmek.

**Architecture:** Keşif yapılacak işleri (TODO'lar) `surveys` belgeleri altında bir array olarak saklanır. Taşeronlar ve ödemeleri ise `taseronlar` ve `taseron_payments` koleksiyonlarında tutulur. Bakiyeler, `done: true` olan iş maliyetleri toplamından yapılan ödemeler çıkartılarak dinamik (real-time) hesaplanır. Arayüzde split-pane yapısı (sol liste, sağ detay kartı) kullanılarak masaüstü ve mobil cihazlarda akıcı bir SaaS deneyimi sunulur.

**Tech Stack:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla ES6), Firebase Firestore.

## Global Constraints

- Tasarımlar Calm UI (sakin arayüz) ilkelerine sadık kalmalıdır.
- Tüm veri kaydetme ve güncelleme işlemleri Firebase Firestore `col()` ve `setupSnapshot()` yapısı ile senkronize çalışmalıdır.
- Mevcut teklif onay ve fatura akışları kesinlikle bozulmamalıdır.
- Derleme doğrulaması `npm run build` ile hatasız tamamlanmalıdır.

---

### Task 1: State ve Firebase Veri Modellerinin Kurulması

**Files:**
- Modify: [js/store.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/store.js)
- Modify: [js/config.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/config.js)

**Interfaces:**
- Consumes: Firestore `setupSnapshot` ve `YSRStore` durum yönetimi.
- Produces: `taseronlar` ve `taseron_payments` global durum değişkenleri ve bunların Firestore anlık görüntü (snapshot) abonelikleri.

- [ ] **Step 1: YSRStore durum tanımlarına taşeron değişkenlerini ekleme**
  `js/store.js` içerisine `taseronlar: []` ve `taseron_payments: []` ekleyin, backward compatibility için pencere nesnesine (window) bağlayın:
  ```javascript
  // js/store.js güncellemesi
  _state: {
    items: [],
    mahals: [],
    users: [],
    logs: [],
    surveys: [],
    reports: [],
    taseronlar: [],
    taseron_payments: [],
    currentUser: null
  }
  // init() metoduna ekleyin:
  this._state.taseronlar = this._wrapArray([], 'taseronlar');
  this._state.taseron_payments = this._wrapArray([], 'taseron_payments');
  // triggerUpdate ekleyin:
  if (type === 'taseronlar' && typeof debouncedRenderTaseron === 'function') debouncedRenderTaseron();
  ```

- [ ] **Step 2: loadAll() fonksiyonuna Firestore aboneliklerini ekleme**
  `js/config.js` içindeki `loadAll()` metoduna yeni koleksiyonların gerçek zamanlı dinleyicilerini ekleyin:
  ```javascript
  // js/config.js güncellemesi
  setupSnapshot('taseronlar', null, null, d => { taseronlar = d; }),
  setupSnapshot('taseron_payments', 'date', 'desc', d => { taseron_payments = d; })
  ```

- [ ] **Step 3: Derleme Testi**
  Run: `npm run build`
  Expected: PASS

---

### Task 2: Keşifler (Site Surveys) TODO ve Taşeron Seçim Arayüzünün Entegrasyonu

**Files:**
- Modify: [index.html](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/index.html)
- Modify: [js/kesifler.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/kesifler.js)
- Modify: [css/style.css](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/css/style.css)

**Interfaces:**
- Consumes: `taseronlar` listesi.
- Produces: Keşif modalındaki dinamik TODO listesi form arayüzü ve veritabanı kaydı.

- [ ] **Step 1: HTML Keşif Modalı TODO alanı tasarımı**
  `index.html` içindeki `kesifModalBg` modal gövdesine yapılacak işler ve taşeron atamalarını ekleyebileceğimiz dinamik bir tablo/akordeon alanı ekleyin:
  ```html
  <div class="accordion-group">
    <div class="accordion-header" onclick="toggleAccordion(this, 'accKesifTodo')">
      <span>Yapılacak İşler ve Taşeron Atamaları</span>
      <span class="arrow">▼</span>
    </div>
    <div class="accordion-content" id="accKesifTodo">
      <div class="todo-manager">
        <table class="todo-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;">İş Tanımı</th>
              <th style="text-align:left; width:150px;">Taşeron</th>
              <th style="text-align:left; width:100px;">Maliyet</th>
              <th style="width:50px;">Bitti</th>
              <th style="width:40px;"></th>
            </tr>
          </thead>
          <tbody id="kesifTodoTbody"></tbody>
        </table>
        <button type="button" class="tb-btn" onclick="addTodoRow()" style="margin-top:10px; width:100%; justify-content:center;">+ Yeni İş Ekle</button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: CSS TODO tablosu ve eleman stilleri**
  `css/style.css` dosyasına todo elemanlarının input ve layout stillerini ekleyin:
  ```css
  .todo-table th { font-size: 11px; text-transform: uppercase; color: var(--text2); padding: 8px 4px; }
  .todo-table td { padding: 6px 4px; }
  .todo-table input, .todo-table select { width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 12px; }
  ```

- [ ] **Step 3: JS Keşif Kayıt/Düzenleme işlemlerinde TODO entegrasyonu**
  `js/kesifler.js` içindeki `openKesifModal` metodunu `todos` listesini dolduracak şekilde güncelleyin:
  ```javascript
  let activeModalTodos = [];
  // openKesifModal içinde:
  activeModalTodos = (isEdit && it.todos) ? [...it.todos] : [];
  renderModalTodos();
  ```
  Yeni dinamik TODO satır yönetimi metodlarını ekleyin:
  ```javascript
  window.renderModalTodos = function() {
    const tbody = document.getElementById('kesifTodoTbody');
    const taseronOptions = taseronlar.map(t => `<option value="${t.id}">${escapeHTML(t.name)} (${escapeHTML(t.expert)})</option>`).join('');
    tbody.innerHTML = activeModalTodos.map((todo, idx) => `
      <tr>
        <td><input type="text" value="${escapeHTML(todo.text)}" onchange="updateTodoField(${idx}, 'text', this.value)" placeholder="İş tanımı..."></td>
        <td>
          <select onchange="updateTodoField(${idx}, 'taseronId', this.value)">
            <option value="">Seçilmedi</option>
            ${taseronlar.map(t => `<option value="${t.id}" ${todo.taseronId === t.id ? 'selected' : ''}>${escapeHTML(t.name)}</option>`).join('')}
          </select>
        </td>
        <td><input type="number" value="${todo.maliyet || 0}" onchange="updateTodoField(${idx}, 'maliyet', parseFloat(this.value) || 0)"></td>
        <td style="text-align:center;"><input type="checkbox" ${todo.done ? 'checked' : ''} onchange="updateTodoField(${idx}, 'done', this.checked)"></td>
        <td><button type="button" class="btn-del" onclick="removeTodoRow(${idx})" style="padding:6px;">&times;</button></td>
      </tr>
    `).join('');
  };
  window.addTodoRow = function() {
    activeModalTodos.push({ id: Math.random().toString(36).substr(2, 9), text: '', taseronId: '', maliyet: 0, done: false });
    renderModalTodos();
  };
  window.removeTodoRow = function(idx) {
    activeModalTodos.splice(idx, 1);
    renderModalTodos();
  };
  window.updateTodoField = function(idx, field, val) {
    activeModalTodos[idx][field] = val;
  };
  ```
  `saveKesif` fonksiyonunda veri paketine `todos: activeModalTodos` ekleyin:
  ```javascript
  const data = {
    mahalId: document.getElementById('fk_mahal').value,
    santiye: document.getElementById('fk_santiye').value,
    kat: document.getElementById('fk_kat').value,
    ktar: document.getElementById('fk_ktar').value,
    sorumlu: document.getElementById('fk_sorumlu').value,
    durum: document.getElementById('fk_durum').value,
    notlar: document.getElementById('fk_notlar').value,
    todos: activeModalTodos
  };
  ```

---

### Task 3: Taşeronlar Tab & Cari Hesap Sayfası Tasarımı ve Mantığı

**Files:**
- Modify: [index.html](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/index.html)
- Modify: [js/ui.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/ui.js)
- Create: [js/taseronlar.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/taseronlar.js)
- Modify: [css/style.css](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/css/style.css)

**Interfaces:**
- Consumes: `taseronlar`, `taseron_payments`, `surveys` global verileri.
- Produces: Taşeron listesi ve cari hesap detaylarının yönetildiği `page_taseronlar` sayfası.

- [ ] **Step 1: HTML Taşeronlar Sayfası ve Menü Entegrasyonu**
  `index.html` içinde `buildTabs` alanına Taşeronlar sekmesini ekleyin. `main.content` altına ise split-pane düzeninde Taşeronlar sayfasını yerleştirin:
  ```html
  <!-- index.html page_taseronlar bölümü -->
  <section class="page" id="page_taseronlar" aria-label="Taşeron Yönetimi Sayfası">
    <div class="taseron-layout">
      <!-- Sol Panel: Taşeron Listesi -->
      <div class="taseron-sidebar">
        <div class="taseron-sidebar-header">
          <h2>Taşeronlar</h2>
          <button class="tb-btn gold" onclick="openNewTaseronModal()">+ Ekle</button>
        </div>
        <div class="taseron-list" id="taseronList"></div>
      </div>
      
      <!-- Sağ Panel: Cari Detayları -->
      <div class="taseron-main" id="taseronDetailPanel" style="display:none;">
        <div class="taseron-main-header">
          <div>
            <h2 id="detTaseronName">-</h2>
            <div id="detTaseronExpert" class="text-muted">-</div>
          </div>
          <div class="cari-summary">
            <div class="summary-box">
              <span class="label">Hak Ediş</span>
              <span class="val green" id="sumHakedis">0.00 ₺</span>
            </div>
            <div class="summary-box">
              <span class="label">Ödenen</span>
              <span class="val purple" id="sumOdenen">0.00 ₺</span>
            </div>
            <div class="summary-box">
              <span class="label">Bakiye</span>
              <span class="val red" id="sumBakiye">0.00 ₺</span>
            </div>
          </div>
        </div>
        
        <div class="taseron-grid-details">
          <!-- Sol Detay: Atanan İşler -->
          <div class="taseron-section">
            <h3>Atanan İşler (Keşifler)</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Şantiye/Proje</th>
                    <th>İş Kalemi</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody id="taseronWorksTbody"></tbody>
              </table>
            </div>
          </div>
          
          <!-- Sağ Detay: Ödeme Hareketleri ve Ödeme Ekleme -->
          <div class="taseron-section">
            <h3>Ödemeler & Cari Hareketler</h3>
            <div class="payment-manager">
              <form id="paymentForm" onsubmit="addTaseronPayment(event)">
                <div class="payment-form-row">
                  <input type="number" id="payAmount" placeholder="Tutar (₺)" required min="0.01" step="0.01">
                  <input type="date" id="payDate" required>
                  <input type="text" id="payNotes" placeholder="Açıklama...">
                  <button type="submit" class="tb-btn gold">Ödeme Ekle</button>
                </div>
              </form>
              <div class="table-wrap" style="margin-top:16px;">
                <table>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Tutar</th>
                      <th>Açıklama</th>
                      <th>Eylemler</th>
                    </tr>
                  </thead>
                  <tbody id="taseronPaymentsTbody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Boş Seçim Durumu -->
      <div class="taseron-empty-state" id="taseronEmptyState">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <p>Detayları ve cari hareketleri görüntülemek için sol menuden bir taşeron seçin.</p>
      </div>
    </div>
  </section>
  
  <!-- YENİ TAŞERON EKLEME MODALI -->
  <div class="modal-bg" id="taseronModalBg">
    <div class="modal" role="dialog">
      <div class="modal-head">
        <h2>Yeni Taşeron Ekle</h2>
        <button class="modal-close" onclick="closeTaseronModal()">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
        <div class="fg">
          <label for="t_name">Taşeron Adı / Ünvanı</label>
          <input type="text" id="t_name" placeholder="Örn: Ahmet Mermer" required>
        </div>
        <div class="fg">
          <label for="t_expert">Uzmanlık Alanı / Branş</label>
          <input type="text" id="t_expert" placeholder="Örn: Mermer Kaplama, Alçı Sıva" required>
        </div>
        <div class="fg">
          <label for="t_phone">İletişim Numarası</label>
          <input type="text" id="t_phone" placeholder="Örn: 0555 123 4567">
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeTaseronModal()">İptal</button>
        <button class="btn-save" onclick="saveTaseron()">Kaydet</button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: CSS Split-Pane Arayüz Kuralları**
  `css/style.css` dosyasına split-pane yerleşim kurallarını ve responsive tasarımları ekleyin:
  ```css
  .taseron-layout { display: flex; gap: 24px; min-height: calc(100vh - 120px); align-items: stretch; }
  .taseron-sidebar { width: 320px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .taseron-main { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
  .taseron-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 60vh; }
  .taseron-card { padding: 12px 16px; background: rgba(var(--card-rgb), 0.5); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
  .taseron-card:hover, .taseron-card.active { border-color: var(--primary); background: var(--primary-bg); }
  .taseron-empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text2); background: var(--card); border: 1px dashed var(--border); border-radius: 16px; padding: 40px; text-align: center; }
  @media (max-width: 1024px) {
    .taseron-layout { flex-direction: column; }
    .taseron-sidebar { width: 100%; }
  }
  ```

- [ ] **Step 3: Taşeron İş Mantığı JavaScript Dosyası (Yeni)**
  `js/taseronlar.js` dosyasını oluşturun ve aşağıdaki cari hesaplama, ödeme ekleme, veri listeleme ve kaydetme metodlarını kodlayın:
  ```javascript
  let activeTaseronId = null;

  window.debouncedRenderTaseron = function() {
    renderTaseronList();
    if (activeTaseronId) {
      selectTaseron(activeTaseronId);
    }
  };

  window.renderTaseronList = function() {
    const list = document.getElementById('taseronList');
    if (!list) return;
    list.innerHTML = taseronlar.map(t => {
      const balance = calculateTaseronCari(t.id);
      return `
        <div class="taseron-card ${activeTaseronId === t.id ? 'active' : ''}" onclick="selectTaseron('${t.id}')">
          <div style="font-weight:700; color:var(--text);">${escapeHTML(t.name)}</div>
          <div style="font-size:11px; color:var(--text2); margin-top:2px;">${escapeHTML(t.expert)}</div>
          <div style="font-weight:600; font-size:13px; margin-top:8px; color:${balance.bakiye > 0 ? 'var(--red)' : 'var(--text2)'};">
            Bakiye: ${fmtMoney(balance.bakiye)} ₺
          </div>
        </div>
      `;
    }).join('');
  };

  window.calculateTaseronCari = function(taseronId) {
    // 1. Hak Edişler (Done=true olan keşif işleri)
    let totalHakedis = 0;
    const works = [];
    surveys.forEach(s => {
      if (s.todos) {
        s.todos.forEach(todo => {
          if (todo.taseronId === taseronId) {
            works.push({ santiye: s.santiye || s.otel || 'Bilinmeyen', todoText: todo.text, maliyet: todo.maliyet || 0, done: todo.done });
            if (todo.done) {
              totalHakedis += todo.maliyet || 0;
            }
          }
        });
      }
    });

    // 2. Ödemeler
    const payments = taseron_payments.filter(p => p.taseronId === taseronId);
    const totalOdenen = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      hakedis: totalHakedis,
      odenen: totalOdenen,
      bakiye: totalHakedis - totalOdenen,
      works: works,
      payments: payments
    };
  };

  window.selectTaseron = function(id) {
    activeTaseronId = id;
    const t = taseronlar.find(x => x.id === id);
    if (!t) return;
    
    document.getElementById('taseronEmptyState').style.display = 'none';
    document.getElementById('taseronDetailPanel').style.display = 'flex';
    
    document.getElementById('detTaseronName').textContent = t.name;
    document.getElementById('detTaseronExpert').textContent = t.expert;
    
    const cari = calculateTaseronCari(id);
    document.getElementById('sumHakedis').textContent = fmtMoney(cari.hakedis) + ' ₺';
    document.getElementById('sumOdenen').textContent = fmtMoney(cari.odenen) + ' ₺';
    document.getElementById('sumBakiye').textContent = fmtMoney(cari.bakiye) + ' ₺';
    
    // İş kalemlerini listele
    const worksTbody = document.getElementById('taseronWorksTbody');
    worksTbody.innerHTML = cari.works.map(w => `
      <tr>
        <td>${escapeHTML(w.santiye)}</td>
        <td>${escapeHTML(w.todoText)}</td>
        <td style="font-weight:600;">${fmtMoney(w.maliyet)} ₺</td>
        <td><span class="badge ${w.done ? 'b-2' : 'b-0'}">${w.done ? 'Bitti' : 'Bekliyor'}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text3);">Atanmış iş kalemi bulunmuyor.</td></tr>';
    
    // Ödemeleri listele
    const payTbody = document.getElementById('taseronPaymentsTbody');
    payTbody.innerHTML = cari.payments.map(p => `
      <tr>
        <td>${escapeHTML(fmt(p.date))}</td>
        <td style="font-weight:600; color:var(--purple);">${fmtMoney(p.amount)} ₺</td>
        <td>${escapeHTML(p.notlar || '-')}</td>
        <td><button class="btn-del" onclick="deleteTaseronPayment('${p.id}')" style="padding:4px 8px;">Sil</button></td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text3);">Kayıtlı ödeme bulunmuyor.</td></tr>';
    
    // Sidebar kartını aktif yap
    renderTaseronList();
  };

  window.openNewTaseronModal = function() {
    document.getElementById('taseronModalBg').classList.add('open');
  };
  window.closeTaseronModal = function() {
    document.getElementById('taseronModalBg').classList.remove('open');
    ['t_name', 't_expert', 't_phone'].forEach(id => document.getElementById(id).value = '');
  };

  window.saveTaseron = async function() {
    const name = document.getElementById('t_name').value.trim();
    const expert = document.getElementById('t_expert').value.trim();
    const phone = document.getElementById('t_phone').value.trim();
    if (!name || !expert) {
      showToast('Ad ve Uzmanlık Alanı gereklidir.', 'error');
      return;
    }
    try {
      await col('taseronlar').add({ name, expert, phone });
      showToast('Taşeron başarıyla eklendi.', 'success');
      closeTaseronModal();
    } catch(e) {
      showToast('Kayıt yapılamadı.', 'error');
    }
  };

  window.addTaseronPayment = async function(e) {
    e.preventDefault();
    if (!activeTaseronId) return;
    const amount = parseFloat(document.getElementById('payAmount').value);
    const date = document.getElementById('payDate').value;
    const notlar = document.getElementById('payNotes').value.trim();
    
    try {
      await col('taseron_payments').add({ taseronId: activeTaseronId, amount, date, notlar });
      showToast('Ödeme başarıyla kaydedildi.', 'success');
      document.getElementById('paymentForm').reset();
      selectTaseron(activeTaseronId);
    } catch(e) {
      showToast('Ödeme kaydedilemedi.', 'error');
    }
  };

  window.deleteTaseronPayment = async function(id) {
    const ok = await showConfirm("Ödeme Silme", "Bu ödeme kaydını silmek istediğinize emin misiniz?", true);
    if (!ok) return;
    try {
      await col('taseron_payments').doc(id).delete();
      showToast('Ödeme silindi.', 'success');
      if (activeTaseronId) selectTaseron(activeTaseronId);
    } catch(e) {
      showToast('Ödeme silinemedi.', 'error');
    }
  };
  ```

- [ ] **Step 4: JS Arayüz Sekmesi Menü Tanımları (ui.js)**
  `js/ui.js` dosyasındaki `buildTabs()` fonksiyonunu güncelleyerek Taşeronlar sekmesini arayüze ekleyin:
  ```javascript
  // buildTabs() içine eklenecek:
  html+=`<div class="tab" id="t_taseronlar" role="tab" tabindex="0" aria-selected="false" onclick="showTab('taseronlar')">Taşeronlar</div>`;
  // Mobil alt menü (Bottom Navigation) içine eklenecek:
  mHtml+=`<button class="mobile-nav-item" id="mn_taseronlar" onclick="showTab('taseronlar')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
    <span>Taşeronlar</span>
  </button>`;
  ```

- [ ] **Step 5: index.html Script Entegrasyonu**
  `index.html` dosyasına `js/taseronlar.js` scriptini dahil edin:
  ```html
  <script type="module" src="js/taseronlar.js"></script>
  ```

---

### Task 4: Doğrulama ve Derleme

- [ ] **Step 1: Üretim Derlemesi**
  Run: `npm run build`
  Expected: PASS (0 syntax/reference errors, output bundle produced successfully)

- [ ] **Step 2: Manuel Kontroller**
  - Keşifler sekmesine gidin, yeni keşif modalını/çekmecesini açın.
  - "Yapılacak İşler ve Taşeron Atamaları" sekmesinden yeni iş ekleyip tutar yazın, kaydedin.
  - Taşeronlar sayfasına geçin. Yeni taşeron tanımlayın.
  - Keşif sayfasına dönüp eklediğiniz todo işine bu taşeronu atayın ve durumu "Bitti" (done: true) yapın.
  - Taşeronlar sayfasına dönerek atanan işin ve hak ediş tutarının bakiye hanesine yansıdığını doğrulayın.
  - Taşeron cari sayfasından ödeme ekleyin ve kalan bakiyenin anlık düştüğünü teyit edin.
