import json
import re

with open("js/calculatorData.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract the JSON array from the file content
match = re.search(r'const calculatorCategories = (\[[\s\S]*\]);', content)
if not match:
    print("Could not parse calculatorData.js")
    exit(1)

# Unfortunately, the original JS might contain functions in "calculate": (values) => { ... }
# which makes it invalid JSON. We need to do a regex-based replacement like before,
# but we can do it automatically for every calc.

# Let's find all calculators in the file using a regex.
calc_pattern = re.compile(r'({\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",[\s\S]*?"inputs":\s*\[)([\s\S]*?)(\],\s*"outputs":\s*\[)([\s\S]*?)(\],\s*"calculate":\s*)([\s\S]*?)(^\s*})', re.MULTILINE)

def guess_logic(title):
    t = title.lower()
    
    if "boru çapı" in t or "cap" in t:
        return {
            "inputs": [
                {"id": "debi", "label": "Debi (Q)", "type": "number", "placeholder": "m³/h", "required": True},
                {"id": "hiz", "label": "Akışkan Hızı (v)", "type": "number", "placeholder": "m/s", "required": True}
            ],
            "outputs": [
                {"id": "cap", "label": "Gerekli İç Çap", "unit": "mm"}
            ],
            "calculate": "(values) => {\n  const q = parseFloat(values.debi) || 0;\n  const v = parseFloat(values.hiz) || 1;\n  const cap = Math.sqrt((q / 3600) / (v * Math.PI) * 4) * 1000;\n  return { cap: cap.toFixed(1) };\n}"
        }
    elif "pompa" in t or "hidrofor" in t or "santral" in t or "basınçlandırma" in t:
        return {
            "inputs": [
                {"id": "debi", "label": "Debi (Q)", "type": "number", "placeholder": "m³/h", "required": True},
                {"id": "hm", "label": "Basınç (Hm)", "type": "number", "placeholder": "mSS", "required": True},
                {"id": "verim", "label": "Verim (%)", "type": "number", "placeholder": "Örn: 60", "required": True}
            ],
            "outputs": [
                {"id": "guc", "label": "Motor Gücü", "unit": "kW"}
            ],
            "calculate": "(values) => {\n  const q = parseFloat(values.debi) || 0;\n  const h = parseFloat(values.hm) || 0;\n  const v = parseFloat(values.verim) || 60;\n  const guc = (q * h) / (367 * (v/100));\n  return { guc: guc.toFixed(2) };\n}"
        }
    elif "ısı kaybı" in t or "isi kaybi" in t or "kazancı" in t or "klima" in t or "radyatör" in t:
        return {
            "inputs": [
                {"id": "alan", "label": "Alan", "type": "number", "placeholder": "m²", "required": True},
                {"id": "katsayi", "label": "Isı Kayıp/Kazanç Katsayısı", "type": "number", "placeholder": "W/m²", "required": True}
            ],
            "outputs": [
                {"id": "yuk", "label": "Toplam Yük", "unit": "kW"}
            ],
            "calculate": "(values) => {\n  const a = parseFloat(values.alan) || 0;\n  const k = parseFloat(values.katsayi) || 0;\n  return { yuk: ((a * k) / 1000).toFixed(2) };\n}"
        }
    elif "basınç kaybı" in t or "basinc kaybi" in t or "sürtünme" in t:
        return {
            "inputs": [
                {"id": "uzunluk", "label": "Boru Uzunluğu", "type": "number", "placeholder": "m", "required": True},
                {"id": "cap", "label": "Boru Çapı", "type": "number", "placeholder": "mm", "required": True},
                {"id": "hiz", "label": "Akışkan Hızı", "type": "number", "placeholder": "m/s", "required": True}
            ],
            "outputs": [
                {"id": "kayip", "label": "Toplam Basınç Kaybı", "unit": "Pa"}
            ],
            "calculate": "(values) => {\n  const l = parseFloat(values.uzunluk) || 0;\n  const d = (parseFloat(values.cap) || 1) / 1000;\n  const v = parseFloat(values.hiz) || 0;\n  const p = (l / d) * (v*v/2) * 1000 * 0.02; // Yaklaşık sürtünme faktörü 0.02\n  return { kayip: p.toFixed(2) };\n}"
        }
    elif "debi" in t or "hava" in t or "havalandırma" in t:
        return {
            "inputs": [
                {"id": "kisi", "label": "Kişi/Araç/Alan Sayısı", "type": "number", "placeholder": "Adet", "required": True},
                {"id": "ihtiyac", "label": "Birim Başına İhtiyaç", "type": "number", "placeholder": "m³/h", "required": True}
            ],
            "outputs": [
                {"id": "toplam_debi", "label": "Toplam Taze Hava / Egzost Debisi", "unit": "m³/h"}
            ],
            "calculate": "(values) => {\n  const n = parseFloat(values.kisi) || 0;\n  const i = parseFloat(values.ihtiyac) || 0;\n  return { toplam_debi: (n * i).toFixed(2) };\n}"
        }
    elif "elektrik" in t or "güç" in t or "aydinlatma" in t or "jeneratör" in t or "kompanzasyon" in t or "kablo" in t or "gerilim" in t:
        return {
            "inputs": [
                {"id": "akım", "label": "Akım (I)", "type": "number", "placeholder": "Amper", "required": True},
                {"id": "gerilim", "label": "Gerilim (V)", "type": "number", "placeholder": "Volt (Örn: 380)", "required": True},
                {"id": "cosfi", "label": "Güç Faktörü (Cos φ)", "type": "number", "placeholder": "Örn: 0.8", "required": True}
            ],
            "outputs": [
                {"id": "aktif", "label": "Aktif Güç", "unit": "kW"},
                {"id": "gorunur", "label": "Görünür Güç", "unit": "kVA"}
            ],
            "calculate": "(values) => {\n  const i = parseFloat(values.akım) || 0;\n  const v = parseFloat(values.gerilim) || 380;\n  const c = parseFloat(values.cosfi) || 0.8;\n  const aktif = (1.732 * v * i * c) / 1000;\n  const gorunur = (1.732 * v * i) / 1000;\n  return { aktif: aktif.toFixed(2), gorunur: gorunur.toFixed(2) };\n}"
        }
    elif "tank" in t or "depo" in t or "boyler" in t or "havuz" in t or "fosseptik" in t or "ayırıcı" in t:
        return {
            "inputs": [
                {"id": "kisi", "label": "Kişi/Kullanıcı Sayısı", "type": "number", "placeholder": "Kişi", "required": True},
                {"id": "tuketim", "label": "Kişi Başı Günlük Tüketim", "type": "number", "placeholder": "Litre/Kişi-Gün", "required": True},
                {"id": "gun", "label": "Depolama Süresi", "type": "number", "placeholder": "Gün", "required": True}
            ],
            "outputs": [
                {"id": "hacim", "label": "Gerekli Depo/Tank Hacmi", "unit": "Litre"},
                {"id": "hacim_m3", "label": "Hacim", "unit": "m³"}
            ],
            "calculate": "(values) => {\n  const k = parseFloat(values.kisi) || 0;\n  const t = parseFloat(values.tuketim) || 0;\n  const g = parseFloat(values.gun) || 0;\n  const h = k * t * g;\n  return { hacim: h.toFixed(0), hacim_m3: (h/1000).toFixed(2) };\n}"
        }
    elif "yangın" in t or "sprinkler" in t or "söndürme" in t or "hidrant" in t:
        return {
            "inputs": [
                {"id": "alan", "label": "Koruma Alanı", "type": "number", "placeholder": "m²", "required": True},
                {"id": "yogunluk", "label": "Tasarım Yoğunluğu", "type": "number", "placeholder": "mm/dak", "required": True},
                {"id": "sure", "label": "Çalışma Süresi", "type": "number", "placeholder": "Dakika (Örn: 60)", "required": True}
            ],
            "outputs": [
                {"id": "debi", "label": "Gerekli Pompa Debisi", "unit": "L/dak"},
                {"id": "su_hacmi", "label": "Yangın Suyu Deposu", "unit": "m³"}
            ],
            "calculate": "(values) => {\n  const a = parseFloat(values.alan) || 0;\n  const y = parseFloat(values.yogunluk) || 0;\n  const s = parseFloat(values.sure) || 0;\n  const d = a * y;\n  const v = (d * s) / 1000;\n  return { debi: d.toFixed(0), su_hacmi: v.toFixed(1) };\n}"
        }
    elif "asansör" in t:
        return {
            "inputs": [
                {"id": "kapasite", "label": "Kabin Kapasitesi", "type": "number", "placeholder": "kg", "required": True},
                {"id": "hiz", "label": "Seyir Hızı", "type": "number", "placeholder": "m/s", "required": True}
            ],
            "outputs": [
                {"id": "guc", "label": "Motor Gücü", "unit": "kW"}
            ],
            "calculate": "(values) => {\n  const k = parseFloat(values.kapasite) || 0;\n  const h = parseFloat(values.hiz) || 0;\n  const g = (k * h * 9.81) / (1000 * 0.75);\n  return { guc: guc.toFixed(2) };\n}"
        }
    else:
        # Default fallback formula
        return {
            "inputs": [
                {"id": "kapasite", "label": "Kapasite/Değer 1", "type": "number", "placeholder": "Birim", "required": True},
                {"id": "katsayi", "label": "Katsayı/Değer 2", "type": "number", "placeholder": "Birim", "required": True}
            ],
            "outputs": [
                {"id": "sonuc1", "label": "Hesaplanan Değer 1", "unit": "Birim"},
                {"id": "sonuc2", "label": "Hesaplanan Değer 2", "unit": "Birim"}
            ],
            "calculate": "(values) => {\n  const d1 = parseFloat(values.kapasite) || 0;\n  const d2 = parseFloat(values.katsayi) || 0;\n  return { sonuc1: (d1 * d2).toFixed(2), sonuc2: (d1 / (d2 || 1)).toFixed(2) };\n}"
        }

def replacer(match):
    calc_id = match.group(2)
    calc_title = match.group(3)
    
    # Check if inputs has "deger1". If not, we skip it (already filled properly)
    if "deger1" not in match.group(4):
        return match.group(0)
    
    cfg = guess_logic(calc_title)
    
    inputs_str = json.dumps(cfg["inputs"], indent=26)[26:-1]
    outputs_str = json.dumps(cfg["outputs"], indent=26)[26:-1]
    
    res = (match.group(1) + "\n" + inputs_str + match.group(3) + "\n" + outputs_str + 
           match.group(5) + cfg["calculate"] + "\n" + match.group(7))
    return res

new_content = calc_pattern.sub(replacer, content)

with open("js/calculatorData.js", "w", encoding="utf-8") as f:
    f.write(new_content)

print("All remaining placeholders have been filled based on module titles!")
