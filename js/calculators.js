/**
 * Dinamik Hesaplama Render Motoru
 * calculatorData.js içindeki JSON verisini okuyarak arayüzü çizer.
 */

class CalculatorEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeCategory = null;
        this.activeCalculator = null;
        
        if(this.container && typeof calculatorCategories !== 'undefined') {
            this.init();
        }
    }

    init() {
        // Ana layout grid'ini kur
        this.container.innerHTML = `
            <div style="display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start;">
                <div class="calculator-sidebar" style="background: var(--panel-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden;">
                    <div style="padding: 16px; font-weight: 600; border-bottom: 1px solid var(--border); background: rgba(var(--primary-rgb), 0.05);">Kategoriler</div>
                    <div id="calc-category-list" style="display: flex; flex-direction: column;"></div>
                </div>
                <div class="calculator-content" style="display: flex; flex-direction: column; gap: 24px;">
                    <div id="calc-module-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;"></div>
                    <div id="calc-form-container" class="panel-card" style="display: none; padding: 24px;"></div>
                </div>
            </div>
        `;

        this.renderCategories();
        
        // İlk kategoriyi seç
        if(calculatorCategories.length > 0) {
            this.selectCategory(calculatorCategories[0].id);
        }
    }

    renderCategories() {
        const list = document.getElementById('calc-category-list');
        list.innerHTML = calculatorCategories.map(cat => `
            <button class="calc-cat-btn" data-id="${cat.id}" onclick="window.calcEngine.selectCategory('${cat.id}')" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; text-align: left; cursor: pointer; border-bottom: 1px solid var(--border); transition: all 0.2s;">
                <span style="color: var(--primary);">${cat.icon || ''}</span>
                <span style="font-size: 14px; font-weight: 500; color: var(--text);">${cat.title}</span>
            </button>
        `).join('');
    }

    selectCategory(categoryId) {
        this.activeCategory = calculatorCategories.find(c => c.id === categoryId);
        this.activeCalculator = null;
        
        // Stil güncellemesi
        document.querySelectorAll('.calc-cat-btn').forEach(btn => {
            if(btn.dataset.id === categoryId) {
                btn.style.background = 'rgba(var(--primary-rgb), 0.1)';
                btn.style.borderLeft = '4px solid var(--primary)';
            } else {
                btn.style.background = 'transparent';
                btn.style.borderLeft = '4px solid transparent';
            }
        });

        // Modülleri listele
        const modContainer = document.getElementById('calc-module-list');
        const formContainer = document.getElementById('calc-form-container');
        
        formContainer.style.display = 'none';
        modContainer.style.display = 'grid';

        if(this.activeCategory && this.activeCategory.calculators) {
            modContainer.innerHTML = this.activeCategory.calculators.map(calc => `
                <div onclick="window.calcEngine.openCalculator('${calc.id}')" class="panel-card" style="padding: 16px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border);">
                    <div style="font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px;">${calc.title}</div>
                    <div style="font-size: 12px; color: var(--text2);">${calc.description}</div>
                </div>
            `).join('');
        }
    }

    openCalculator(calcId) {
        this.activeCalculator = this.activeCategory.calculators.find(c => c.id === calcId);
        
        const modContainer = document.getElementById('calc-module-list');
        const formContainer = document.getElementById('calc-form-container');
        
        modContainer.style.display = 'none';
        formContainer.style.display = 'block';

        this.renderForm();
    }

    renderForm() {
        const formContainer = document.getElementById('calc-form-container');
        if(!this.activeCalculator) return;

        const c = this.activeCalculator;

        let inputsHtml = c.inputs.map(inp => `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 500; color: var(--text);">${inp.label} ${inp.required ? '<span style="color:#ef4444">*</span>' : ''}</label>
                <input type="${inp.type}" id="calc_inp_${inp.id}" placeholder="${inp.placeholder || ''}" value="${inp.defaultValue || ''}" class="input-field" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
            </div>
        `).join('');

        let outputsHtml = c.outputs.map(out => `
            <div style="background: rgba(var(--primary-rgb), 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(var(--primary-rgb), 0.2); text-align: center;">
                <div style="font-size: 12px; color: var(--text2); margin-bottom: 4px;">${out.label}</div>
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                    <span id="calc_out_${out.id}">-</span> <span style="font-size: 14px; color: var(--text2);">${out.unit}</span>
                </div>
            </div>
        `).join('');

        formContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 24px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 4px;">${c.title}</h3>
                    <div style="font-size: 13px; color: var(--text2);">${c.description}</div>
                </div>
                <button onclick="window.calcEngine.selectCategory('${this.activeCategory.id}')" class="btn-secondary" style="padding: 8px 16px;">Geri Dön</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${inputsHtml}
                    <button onclick="window.calcEngine.calculate()" class="btn-save" style="margin-top: 8px; padding: 12px;">Hesapla</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--text);">Sonuçlar</div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                        ${outputsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    calculate() {
        if(!this.activeCalculator) return;

        // Değerleri topla
        const values = {};
        let hasError = false;

        this.activeCalculator.inputs.forEach(inp => {
            const el = document.getElementById(`calc_inp_${inp.id}`);
            const val = el.value.trim();
            
            if(inp.required && val === "") {
                el.style.borderColor = "#ef4444";
                hasError = true;
            } else {
                el.style.borderColor = "var(--border)";
            }

            if(inp.type === "number") {
                values[inp.id] = parseFloat(val) || 0;
            } else {
                values[inp.id] = val;
            }
        });

        if(hasError) {
            alert("Lütfen zorunlu alanları doldurun.");
            return;
        }

        try {
            const results = this.activeCalculator.calculate(values);
            
            // Sonuçları ekrana bas
            this.activeCalculator.outputs.forEach(out => {
                const outEl = document.getElementById(`calc_out_${out.id}`);
                if(outEl && results[out.id] !== undefined) {
                    outEl.innerText = results[out.id];
                }
            });
        } catch (e) {
            console.error("Hesaplama Hatası:", e);
            alert("Hesaplama sırasında bir hata oluştu.");
        }
    }
}

// Global instance
window.addEventListener('DOMContentLoaded', () => {
    // Check if the container exists, if not it will be initialized when tab is opened
    const container = document.getElementById('mekanik-hesaplamalar-container');
    if(container) {
        window.calcEngine = new CalculatorEngine('mekanik-hesaplamalar-container');
    }
});
