// ── ANALİZ DEĞERLERİ & GRAFİKLERİ ────────────────────────────────
function renderCharts() {
  if (typeof Chart === 'undefined') {
    document.getElementById('analizStatsGrid').innerHTML = '<div style="color:var(--red); font-weight:600; padding:20px;">Grafik kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.</div>';
    return;
  }

  try {
    const t=items.length;
    const approvedItems = items.filter(i=>['Onaylandı','İş Yapım Aşamasında','Tamamlandı','Faturalandı'].includes(i.durum));
    const on = approvedItems.length;
    
    const approvalRate = t > 0 ? Math.round((on / t) * 100) : 0;
    const totApproved = approvedItems.reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0);
    const activePipelineVal = items
      .filter(i=>['Onaylandı','İş Yapım Aşamasında'].includes(i.durum))
      .reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0);

    // Calculate segmented sums by currency for Approved (Onaylanan) and Active Pipeline (Aktif Yapım)
    const approvedSums = {
      '₺': approvedItems.filter(i => i.cur === '₺' || !i.cur).reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '$': approvedItems.filter(i => i.cur === '$').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '€': approvedItems.filter(i => i.cur === '€').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0)
    };

    const activeItems = items.filter(i=>['Onaylandı','İş Yapım Aşamasında'].includes(i.durum));
    const activeSums = {
      '₺': activeItems.filter(i => i.cur === '₺' || !i.cur).reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '$': activeItems.filter(i => i.cur === '$').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0),
      '€': activeItems.filter(i => i.cur === '€').reduce((s,i)=>s+(Number(i.otut || i.ttut)||0), 0)
    };

    const currencyKeys = ['₺', '$', '€'];
    const curLabelsApproved = { '₺': 'Onaylanan Hacim (₺)', '$': 'Onaylanan Hacim ($)', '€': 'Onaylanan Hacim (€)' };
    const curLabelsActive = { '₺': 'Aktif Yapım Hacmi (₺)', '$': 'Aktif Yapım Hacmi ($)', '€': 'Aktif Yapım Hacmi (€)' };

    const renderApprovedVal = () => {
      const cur = currencyKeys[currentStatCurrencyIdx];
      return `
        <div class="stat-lbl" style="transition: opacity 0.3s ease;">${curLabelsApproved[cur]}</div>
        <div class="stat-val" style="transition: opacity 0.3s ease; color:var(--green);">
          <span>${approvedSums[cur].toLocaleString('tr-TR')}\u00A0${cur}</span>
        </div>`;
    };

    const renderActiveVal = () => {
      const cur = currencyKeys[currentStatCurrencyIdx];
      return `
        <div class="stat-lbl" style="transition: opacity 0.3s ease;">${curLabelsActive[cur]}</div>
        <div class="stat-val" style="transition: opacity 0.3s ease; color:var(--blue);">
          <span>${activeSums[cur].toLocaleString('tr-TR')}\u00A0${cur}</span>
        </div>`;
    };

    document.getElementById('analizStatsGrid').innerHTML = `
      <div class="stat-card clickable" onclick="showStatDetails('approved')">
        <div class="stat-lbl">Onay Oranı (%)</div>
        <div class="stat-val" style="color:var(--primary)">%${approvalRate}</div>
      </div>
      <div class="stat-card clickable" id="analizApprovedCard" style="cursor: pointer; user-select: none;">
        <div id="analizApprovedContent">${renderApprovedVal()}</div>
      </div>
      <div class="stat-card clickable" id="analizActiveCard" style="cursor: pointer; user-select: none;">
        <div id="analizActiveContent">${renderActiveVal()}</div>
      </div>
      <div class="stat-card clickable" onclick="showStatDetails('all')">
        <div class="stat-lbl">Toplam Havuz Sayısı</div>
        <div class="stat-val">${t} adet</div>
      </div>`;

    // Connect event bindings for the Analiz page statistical cards
    const apCard = document.getElementById('analizApprovedCard');
    const acCard = document.getElementById('analizActiveCard');
    
    const cycleAnalizCurrencies = (dir = 1) => {
      const apContent = document.getElementById('analizApprovedContent');
      const acContent = document.getElementById('analizActiveContent');
      if (apContent && acContent) {
        apContent.style.opacity = '0';
        apContent.style.transform = 'translateY(3px)';
        acContent.style.opacity = '0';
        acContent.style.transform = 'translateY(3px)';
        
        setTimeout(() => {
          apContent.innerHTML = renderApprovedVal();
          acContent.innerHTML = renderActiveVal();
          
          apContent.style.opacity = '1';
          apContent.style.transform = 'translateY(0)';
          acContent.style.opacity = '1';
          acContent.style.transform = 'translateY(0)';
        }, 180);
      }
    };

    const triggerManualAnalizCycle = (dir = 1) => {
      currentStatCurrencyIdx = (currentStatCurrencyIdx + dir + 3) % 3;
      cycleAnalizCurrencies(dir);
      
      // Update main statistics card index to match consistently
      const mainContent = document.getElementById('multiCurrencyStatContent');
      if (mainContent && typeof renderCurrencyVal === 'function') {
        mainContent.innerHTML = renderCurrencyVal();
      }
    };

    if (apCard && acCard) {
      apCard.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerManualAnalizCycle(1);
      });
      acCard.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerManualAnalizCycle(1);
      });

      apCard.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        triggerManualAnalizCycle(e.deltaY > 0 ? 1 : -1);
      }, { passive: false });
      acCard.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        triggerManualAnalizCycle(e.deltaY > 0 ? 1 : -1);
      }, { passive: false });
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const gridColor = isDark ? 'rgba(248, 250, 252, 0.1)' : 'rgba(15, 23, 42, 0.08)';

    const categories = ['İnşaat', 'Mekanik', 'Elektrik', 'Diğer'];
    const catCounts = categories.map(cat => items.filter(it => it.kat === cat).length);
    
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    if (catChartInstance) catChartInstance.destroy();
    
    catChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: catCounts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(148, 163, 184, 0.75)'
          ],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, item) => {
          const points = catChartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
          const activePoints = points.length ? points : item;
          if (activePoints && activePoints.length > 0) {
            const index = activePoints[0].index;
            const categoryName = categories[index];
            showStatDetails('category_' + categoryName);
          }
        },
        onHover: (evt, activeElements) => {
          if (evt.native && evt.native.target) {
            evt.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          }
        }
      }
    });

    // Segment data by currency and status for a clean dynamic stacked bar chart
    const currencies = ['₺', '$', '€'];
    const curLabels = { '₺': 'TL (₺)', '$': 'USD ($)', '€': 'EUR (€)' };
    const curColors = {
      '₺': { fill: 'rgba(99, 102, 241, 0.8)', border: 'rgba(99, 102, 241, 1)' },
      '$': { fill: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
      '€': { fill: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' }
    };

    const datasets = currencies.map(cur => {
      const data = STAT_NAMES.map(stat => {
        return items
          .filter(it => it.durum === stat && (it.cur === cur || (!it.cur && cur === '₺')))
          .reduce((sum, it) => sum + (Number(it.ttut || 0)), 0);
      });
      return {
        label: curLabels[cur],
        data: data,
        backgroundColor: curColors[cur].fill,
        borderColor: curColors[cur].border,
        borderWidth: 1.5,
        borderRadius: 6
      };
    });

    const ctxStat = document.getElementById('statusChart').getContext('2d');
    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(ctxStat, {
      type: 'bar',
      data: {
        labels: STAT_NAMES,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, item) => {
          const points = statusChartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
          const activePoints = points.length ? points : item;
          if (activePoints && activePoints.length > 0) {
            const index = activePoints[0].index;
            const statusName = STAT_NAMES[index];
            showStatDetails('status_' + statusName);
          }
        },
        onHover: (evt, activeElements) => {
          if (evt.native && evt.native.target) {
            evt.native.target.style.cursor = activeElements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const label = context.dataset.label.split(' ')[0];
                const symbol = label === 'TL' ? '₺' : (label === 'USD' ? '$' : '€');
                return `${context.dataset.label}: ${val.toLocaleString('tr-TR')} ${symbol}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          }
        }
      }
    });

    // 2. Mahal ve Kategori Matrisi (Stacked Bar Chart in TL)
    const mNames = mahals.map(m => m.name);
    const getTlVal = (it) => {
      const val = Number(it.ttut) || 0;
      if (it.cur === '$') return val * 32.5;
      if (it.cur === '€') return val * 35.2;
      return val;
    };
    
    const catDatasets = categories.map((cat, catIdx) => {
      const data = mahals.map(m => {
        return items
          .filter(it => it.mahalId === m.id && it.kat === cat)
          .reduce((sum, it) => sum + getTlVal(it), 0);
      });
      
      const catColors = [
        'rgba(59, 130, 246, 0.75)',
        'rgba(16, 185, 129, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(148, 163, 184, 0.75)'
      ];
      
      return {
        label: cat,
        data: data,
        backgroundColor: catColors[catIdx],
        borderColor: isDark ? '#111827' : '#ffffff',
        borderWidth: 1,
        borderRadius: 4
      };
    });

    const ctxMahalCat = document.getElementById('mahalCategoryChart').getContext('2d');
    if (mahalCategoryChartInstance) mahalCategoryChartInstance.destroy();
    mahalCategoryChartInstance = new Chart(ctxMahalCat, {
      type: 'bar',
      data: {
        labels: mNames.length ? mNames : ['Mahal Yok'],
        datasets: catDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${Math.round(context.raw).toLocaleString('tr-TR')} ₺`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          }
        }
      }
    });

    // 3. Dönemsel Teklif Trendi (Line Chart - Last 6 Months)
    const monthNamesTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const getMonthLabel = (dateStr) => {
      if (!dateStr) return '';
      const pts = dateStr.split('-');
      if (pts.length < 2) return '';
      const y = pts[0].substring(2);
      const m = parseInt(pts[1], 10) - 1;
      return `${monthNamesTr[m]} '${y}`;
    };

    // Calculate month counts dynamically
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      last6Months.push({ key: `${y}-${m}`, label: `${monthNamesTr[d.getMonth()]} '${String(y).substring(2)}` });
    }

    const trendData = last6Months.map(mObj => {
      return items.filter(it => it.ttar && it.ttar.startsWith(mObj.key)).length;
    });

    const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
    if (monthlyTrendChartInstance) monthlyTrendChartInstance.destroy();
    monthlyTrendChartInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: last6Months.map(m => m.label),
        datasets: [{
          label: 'Aylık Teklif Adedi',
          data: trendData,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Teklif Sayısı: ${context.raw} adet`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { 
              precision: 0,
              color: textColor, 
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } 
            }
          }
        }
      }
    });

    // 4. Kategori Bazlı Teklif Kazanma / Onay Oranları (Horizontal Bar Chart)
    const winRates = categories.map(cat => {
      const catItems = items.filter(it => it.kat === cat);
      if (!catItems.length) return 0;
      const approvedCount = catItems.filter(it => ['Onaylandı', 'İş Yapım Aşamasında', 'Tamamlandı', 'Faturalandı'].includes(it.durum)).length;
      return Math.round((approvedCount / catItems.length) * 100);
    });

    const ctxConv = document.getElementById('conversionChart').getContext('2d');
    if (conversionChartInstance) conversionChartInstance.destroy();
    conversionChartInstance = new Chart(ctxConv, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Kazanma Oranı (%)',
          data: winRates,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(148, 163, 184, 0.8)'
          ],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Başarı Oranı: %${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { 
              callback: value => `%${value}`,
              color: textColor, 
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' } 
            }
          },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          }
        }
      }
    });
  } catch(err) {
    console.error("Grafik yükleme hatası: ", err);
  }
}