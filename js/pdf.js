// PDF Generation Module
window.generatePDF = async function(itemId) {
  if (!window.jspdf || !window.html2canvas) {
    alert("PDF kütüphaneleri yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
    return;
  }
  
  const it = window.appData.items.find(i => i.id === itemId);
  if (!it) return;

  // Show loading indicator
  const loading = document.createElement('div');
  loading.style.position = 'fixed';
  loading.style.top = '0'; loading.style.left = '0';
  loading.style.width = '100%'; loading.style.height = '100%';
  loading.style.background = 'rgba(0,0,0,0.8)';
  loading.style.color = '#fff';
  loading.style.display = 'flex';
  loading.style.alignItems = 'center';
  loading.style.justifyContent = 'center';
  loading.style.zIndex = '99999';
  loading.style.fontSize = '20px';
  loading.style.fontWeight = 'bold';
  loading.innerText = 'PDF Hazırlanıyor... Lütfen Bekleyin.';
  document.body.appendChild(loading);

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Create a hidden div to render the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.background = '#ffffff';
    container.style.color = '#1e293b';
    container.style.fontFamily = 'sans-serif';
    
    const cur = it.cur || '₺';
    
    container.innerHTML = `
      <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin:0; font-size: 32px; color: #1e293b;">YSR CONSTRUCTION</h1>
          <div style="color: #64748b; font-size: 14px; margin-top: 5px;">Teklif Takip & Yönetim Sistemi</div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin:0; font-size: 24px; color: #4f46e5;">TEKLİF FORMU</h2>
          <div style="color: #64748b; margin-top: 5px;">Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
          <div style="color: #64748b;">Ref No: ${it.id.substring(0,8).toUpperCase()}</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin-top:0; color: #334155; font-size: 14px; text-transform: uppercase;">Müşteri / İşveren</h3>
          <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${it.mahal || '-'}</div>
          <div style="margin-top: 5px; color: #475569;">Otel/Şantiye: ${it.otel || '-'}</div>
        </div>
        <div style="width: 48%; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin-top:0; color: #334155; font-size: 14px; text-transform: uppercase;">İş Tanımı</h3>
          <div style="font-size: 16px; font-weight: bold; color: #0f172a;">${it.is_tanimi || '-'}</div>
          <div style="margin-top: 5px; color: #475569;">Durum: <span style="font-weight:bold; color: #4f46e5;">${it.durum || '-'}</span></div>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 12px 15px; border-bottom: 2px solid #cbd5e1; color: #475569;">Açıklama</th>
            <th style="padding: 12px 15px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Teklif Edilen Tutar</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px;">${fmtN(it.ttut, cur)}</td>
          </tr>
          ${it.otut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #10b981;">Onaylanan Tutar</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #10b981;">${fmtN(it.otut, cur)}</td>
          </tr>` : ''}
          ${it.htut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #8b5cf6;">Hakediş Tutarı</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #8b5cf6;">${fmtN(it.htut, cur)}</td>
          </tr>` : ''}
          ${it.ftut ? `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #3b82f6;">Fatura Tutarı</td>
            <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #3b82f6;">${fmtN(it.ftut, cur)}</td>
          </tr>` : ''}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Teklif Tarihi</div>
          <div style="font-weight: bold;">${it.ttar || '-'}</div>
        </div>
        <div style="width: 48%;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Başlangıç - Bitiş</div>
          <div style="font-weight: bold;">${it.bas || '-'} / ${it.bit || '-'}</div>
        </div>
      </div>
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        Bu belge YSR Teklif Takip sistemi tarafından otomatik olarak oluşturulmuştur.<br>
        © ${new Date().getFullYear()} YSR Construction
      </div>
    `;
    
    document.body.appendChild(container);
    
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`Teklif_${it.otel || 'İsimsiz'}_${it.id.substring(0,4)}.pdf`);
    
    document.body.removeChild(container);
    
    // Log the action
    if (window.logAction) {
      window.logAction(it.id, "PDF Çıktısı Alındı", "Kullanıcı teklifin PDF çıktısını indirdi.");
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("PDF oluşturulurken bir hata oluştu.");
  } finally {
    document.body.removeChild(loading);
  }
};
