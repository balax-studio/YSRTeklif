import re
import json

with open("js/calculatorData.js", "r", encoding="utf-8") as f:
    content = f.read()

# Define the new configurations for Isıtma Tesisatı
configs = {
    "pratik_isi_kaybi": {
        "inputs": [
            {"id": "alan", "label": "Mahal Alanı", "type": "number", "placeholder": "m²", "required": True},
            {"id": "yukseklik", "label": "Tavan Yüksekliği", "type": "number", "placeholder": "m (örn: 2.8)", "required": True},
            {"id": "bolge", "label": "İklim Bölgesi", "type": "select", "options": [{"value": "1", "label": "1. Bölge (Ilıman)"}, {"value": "2", "label": "2. Bölge (Normal)"}, {"value": "3", "label": "3. Bölge (Soğuk)"}, {"value": "4", "label": "4. Bölge (Çok Soğuk)"}], "required": True},
            {"id": "izolasyon", "label": "İzolasyon Durumu", "type": "select", "options": [{"value": "iyi", "label": "İyi"}, {"value": "orta", "label": "Orta"}, {"value": "zayif", "label": "Zayıf"}], "required": True}
        ],
        "outputs": [
            {"id": "hacim", "label": "Mahal Hacmi", "unit": "m³"},
            {"id": "isiyuku", "label": "Gerekli Isı Yükü", "unit": "kcal/h"},
            {"id": "isiyuku_kw", "label": "Gerekli Isı Yükü", "unit": "kW"}
        ],
        "calculate": """(values) => {
                    const alan = parseFloat(values.alan) || 0;
                    const yukseklik = parseFloat(values.yukseklik) || 0;
                    const hacim = alan * yukseklik;
                    
                    let katsayi = 30; // kcal/m3 temel
                    
                    if (values.bolge === "1") katsayi = 30;
                    else if (values.bolge === "2") katsayi = 40;
                    else if (values.bolge === "3") katsayi = 50;
                    else if (values.bolge === "4") katsayi = 60;
                    
                    if (values.izolasyon === "iyi") katsayi *= 0.8;
                    else if (values.izolasyon === "zayif") katsayi *= 1.3;
                    
                    const isiyuku = hacim * katsayi;
                    const isiyuku_kw = isiyuku / 860;
                    
                    return {
                        hacim: hacim.toFixed(2),
                        isiyuku: Math.round(isiyuku),
                        isiyuku_kw: isiyuku_kw.toFixed(2)
                    };
                }"""
    },
    "genlesme_tanki": {
        "inputs": [
            {"id": "kapasite", "label": "Kazan Kapasitesi", "type": "number", "placeholder": "kcal/h", "required": True},
            {"id": "sistemsuhacmi", "label": "Sistemdeki Su Hacmi (Vs)", "type": "number", "placeholder": "Litre (bilinmiyorsa 0 bırakın)", "required": False},
            {"id": "sistembasinci", "label": "Statik Basınç (Bina Yüksekliği / 10)", "type": "number", "placeholder": "Bar", "required": True},
            {"id": "emniyetventili", "label": "Emniyet Ventili Basıncı", "type": "number", "placeholder": "Bar (Örn: 3)", "required": True},
            {"id": "maks_sicaklik", "label": "Maksimum Su Sıcaklığı", "type": "number", "placeholder": "°C (Örn: 90)", "required": True}
        ],
        "outputs": [
            {"id": "suhacmi", "label": "Hesaplanan Sistem Su Hacmi", "unit": "Litre"},
            {"id": "genlesen_su", "label": "Genleşen Su Hacmi", "unit": "Litre"},
            {"id": "tank_hacmi", "label": "Gerekli Genleşme Tankı Hacmi", "unit": "Litre"}
        ],
        "calculate": """(values) => {
                    const kapasite = parseFloat(values.kapasite) || 0;
                    let vs = parseFloat(values.sistemsuhacmi) || 0;
                    const pst = parseFloat(values.sistembasinci) || 0;
                    const pmax = parseFloat(values.emniyetventili) || 3;
                    const sicaklik = parseFloat(values.maks_sicaklik) || 90;
                    
                    // Su hacmi bilinmiyorsa kapasiteden yaklaşık: 10 l / 1000 kcal/h
                    if (vs === 0) {
                        vs = (kapasite / 1000) * 10;
                    }
                    
                    // Genleşme katsayısı (yaklaşık 90C için 0.0359, 80C için 0.029)
                    let n = 0.0359;
                    if (sicaklik <= 70) n = 0.0227;
                    else if (sicaklik <= 80) n = 0.0290;
                    else if (sicaklik <= 90) n = 0.0359;
                    else if (sicaklik <= 100) n = 0.0434;
                    
                    const genlesen = vs * n;
                    
                    // P_ilk = P_statik + 0.5 bar
                    const pi = pst + 0.5;
                    // P_son = P_emniyet - 0.5 bar
                    const pf = pmax - 0.5;
                    
                    let tank = 0;
                    if (pf > pi) {
                        // V_tank = V_genlesen * (Pf + 1) / (Pf - Pi)
                        tank = genlesen * (pf + 1) / (pf - pi);
                    }
                    
                    return {
                        suhacmi: Math.round(vs),
                        genlesen_su: genlesen.toFixed(2),
                        tank_hacmi: Math.round(tank)
                    };
                }"""
    },
    "pratik_sirkulasyon_pompasi": {
        "inputs": [
            {"id": "kapasite", "label": "Isı Yükü (Kapasite)", "type": "number", "placeholder": "kcal/h", "required": True},
            {"id": "dt", "label": "Sıcaklık Farkı (ΔT)", "type": "number", "placeholder": "°C (Örn: 20)", "required": True},
            {"id": "basinc_kaybi", "label": "Sistem Basınç Kaybı", "type": "number", "placeholder": "mSS", "required": True}
        ],
        "outputs": [
            {"id": "debi", "label": "Gerekli Pompa Debisi (Q)", "unit": "m³/h"},
            {"id": "hm", "label": "Gerekli Pompa Basıncı (Hm)", "unit": "mSS"},
            {"id": "guc", "label": "Yaklaşık Motor Gücü", "unit": "kW"}
        ],
        "calculate": """(values) => {
                    const kapasite = parseFloat(values.kapasite) || 0;
                    const dt = parseFloat(values.dt) || 20;
                    const basinc = parseFloat(values.basinc_kaybi) || 0;
                    
                    // Debi = Q(kcal) / (dt * 1000)
                    const debi = kapasite / (dt * 1000);
                    
                    // Güç (kW) = (Q * Hm) / (367 * verim) (Su için, yoğunluk 1)
                    // Verim yaklaşık %60 alalım
                    const guc = (debi * basinc) / (367 * 0.6);
                    
                    return {
                        debi: debi.toFixed(2),
                        hm: basinc.toFixed(2),
                        guc: guc.toFixed(2)
                    };
                }"""
    },
    "boyler": {
        "inputs": [
            {"id": "kullanici", "label": "Kullanıcı Sayısı", "type": "number", "placeholder": "Kişi", "required": True},
            {"id": "tuketim", "label": "Kişi Başı Günlük Tüketim", "type": "number", "placeholder": "Litre/Kişi-Gün (Örn: 60)", "required": True},
            {"id": "isima_suresi", "label": "İstenen Isınma Süresi", "type": "number", "placeholder": "Saat (Örn: 2)", "required": True},
            {"id": "su_sicakligi", "label": "Kullanım Suyu Sıcaklığı", "type": "number", "placeholder": "°C (Örn: 45)", "required": True},
            {"id": "sebeke_sicakligi", "label": "Şebeke Suyu Sıcaklığı", "type": "number", "placeholder": "°C (Örn: 10)", "required": True}
        ],
        "outputs": [
            {"id": "gunluk_tuketim", "label": "Günlük Sıcak Su İhtiyacı", "unit": "Litre/Gün"},
            {"id": "boyler_hacmi", "label": "Önerilen Boyler Hacmi", "unit": "Litre"},
            {"id": "serpantin_yuku", "label": "Gerekli Isıtma Gücü", "unit": "kW"}
        ],
        "calculate": """(values) => {
                    const kullanici = parseFloat(values.kullanici) || 0;
                    const tuketim = parseFloat(values.tuketim) || 60;
                    const sure = parseFloat(values.isima_suresi) || 2;
                    const t_kullanim = parseFloat(values.su_sicakligi) || 45;
                    const t_sebeke = parseFloat(values.sebeke_sicakligi) || 10;
                    
                    const gunluk = kullanici * tuketim;
                    
                    // Boyler hacmi eş zamanlı kullanım faktörüne göre genelde tüketimin %40-50'si kadar alınır.
                    // Ya da formül gereği pik ihtiyaca göre. Biz %50 diyelim.
                    const hacim = gunluk * 0.5;
                    
                    // Isıtma Gücü Q = m * c * ΔT / sure
                    // c = 4.18 kJ/kgK -> kW = (m(litre) * 4.18 * (Tkullanim - Tsebeke)) / (sure * 3600)
                    const guc_kw = (hacim * 4.18 * (t_kullanim - t_sebeke)) / (sure * 3600);
                    
                    return {
                        gunluk_tuketim: Math.round(gunluk),
                        boyler_hacmi: Math.round(hacim),
                        serpantin_yuku: guc_kw.toFixed(2)
                    };
                }"""
    }
}

import re

for calc_id, cfg in configs.items():
    inputs_str = json.dumps(cfg["inputs"], indent=26)
    outputs_str = json.dumps(cfg["outputs"], indent=26)
    
    # We will search for id: "calc_id" block in the file.
    pattern = r'({\s*"id":\s*"' + calc_id + r'"[\s\S]*?"inputs":\s*\[)([\s\S]*?)(\],\s*"outputs":\s*\[)([\s\S]*?)(\],\s*"calculate":\s*)([\s\S]*?)(^\s*})'
    
    def replacer(match):
        return match.group(1) + "\n" + inputs_str[26:-1] + match.group(3) + "\n" + outputs_str[26:-1] + match.group(5) + cfg["calculate"] + "\n" + match.group(7)
        
    content = re.sub(pattern, replacer, content, flags=re.MULTILINE)

with open("js/calculatorData.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
