/**
 * tesisat.org/online/ adresindeki hesaplamaları temsil eden statik veri yapısı.
 * Her bir kategori ve altındaki hesaplama modülleri burada tanımlanır.
 */

const calculatorCategories = [
    {
        id: "isitma_tesisati",
        title: "Isıtma Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>',
        calculators: [
            {
                id: "ts2164isikaybi",
                title: "TS 2164 Isı Kaybı",
                description: "TS 2164 Isı Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "ts12831isikaybi",
                title: "TS 12831-1 Isı Kaybı",
                description: "TS 12831-1 Isı Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "isikaybi",
                title: "Pratik Isı Kaybı",
                description: "Hızlı ve pratik bir şekilde ısı kaybı tahmini yapar.",
                inputs: [
                          {
                                    "id": "alan",
                                    "label": "Alan (m²)",
                                    "type": "number",
                                    "placeholder": "Örn: 100",
                                    "required": true
                          },
                          {
                                    "id": "yukseklik",
                                    "label": "Yükseklik (m)",
                                    "type": "number",
                                    "placeholder": "Örn: 2.8",
                                    "required": true
                          },
                          {
                                    "id": "bolgeK",
                                    "label": "Bölge Katsayısı (W/m³)",
                                    "type": "number",
                                    "placeholder": "Örn: 45",
                                    "required": true,
                                    "defaultValue": 45
                          }
                ],
                outputs: [
                          {
                                    "id": "isiKaybi",
                                    "label": "Yaklaşık Isı Kaybı",
                                    "unit": "W"
                          },
                          {
                                    "id": "isiKaybiKcal",
                                    "label": "Yaklaşık Isı Kaybı",
                                    "unit": "kcal/h"
                          }
                ],
                calculate: (values) => {
                    const { alan, yukseklik, bolgeK } = values;
                    const hacim = alan * yukseklik;
                    const watt = hacim * bolgeK;
                    const kcal = watt * 0.86;
                    return { isiKaybi: watt.toFixed(2), isiKaybiKcal: kcal.toFixed(2) };
                }
            },
            {
                id: "radyator",
                title: "Radyatör Seçimi",
                description: "Radyatör Seçimi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "konvektor",
                title: "Konvektör Seçimi",
                description: "Konvektör Seçimi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yerdenisitma",
                title: "Yerden Isıtma",
                description: "Yerden Isıtma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "kollektor",
                title: "Kollektör",
                description: "Kollektör hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "motorlu",
                title: "Motorlu Vana",
                description: "Motorlu Vana hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "pompabasinc",
                title: "Pompa Basınç Kaybı Hesabı",
                description: "Pompa Basınç Kaybı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "sirkulasyon",
                title: "Pratik Sirkülasyon Pompası",
                description: "Pratik Sirkülasyon Pompası hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "denge",
                title: "Denge Kabı",
                description: "Denge Kabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "genlesme",
                title: "Genleşme Tankı",
                description: "Genleşme Tankı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "stoker",
                title: "Stoker Süreleri",
                description: "Stoker Süreleri hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "i_klimlendirme_tesisati",
        title: "İklimlendirme Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="M19 19l-7-7 7-7"/><path d="M5 19l7-7-7-7"/></svg>',
        calculators: [
            {
                id: "isikazanci",
                title: "Isı Kazancı Hesabı",
                description: "Isı Kazancı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "klima",
                title: "Pratik Klima Hesabı",
                description: "Mahal alanı baz alınarak pratik klima kapasitesi hesaplar.",
                inputs: [
                          {
                                    "id": "alan",
                                    "label": "Alan (m²)",
                                    "type": "number",
                                    "placeholder": "Örn: 25",
                                    "required": true
                          },
                          {
                                    "id": "kisiSayisi",
                                    "label": "Kişi Sayısı",
                                    "type": "number",
                                    "placeholder": "Örn: 2",
                                    "required": true,
                                    "defaultValue": 2
                          }
                ],
                outputs: [
                          {
                                    "id": "kapasiteBTU",
                                    "label": "Soğutma Kapasitesi",
                                    "unit": "BTU/h"
                          },
                          {
                                    "id": "kapasiteKW",
                                    "label": "Soğutma Kapasitesi",
                                    "unit": "kW"
                          }
                ],
                calculate: (values) => {
                    const { alan, kisiSayisi } = values;
                    const btu = (alan * 400) + (kisiSayisi * 600);
                    const kw = btu / 3412.142;
                    return { kapasiteBTU: btu.toFixed(0), kapasiteKW: kw.toFixed(2) };
                }
            },
            {
                id: "fancoil",
                title: "Fancoil İç Ünite Hesabı",
                description: "Fancoil İç Ünite Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "vrf",
                title: "VRF İç ve Dış Ünite Hesabı",
                description: "VRF İç ve Dış Ünite Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "vrfborucap",
                title: "VRF Boru Çapı Hesabı",
                description: "VRF Boru Çapı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "chiller",
                title: "Chiller Sistem Seçimi",
                description: "Chiller Sistem Seçimi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "sogutmakulesi",
                title: "Soğutma Kulesi Hesabı",
                description: "Soğutma Kulesi Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "isipompasi",
                title: "Isı Pompası Hesabı",
                description: "Isı Pompası Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "klimagaz",
                title: "Klima İlave Gaz Dolum",
                description: "Klima İlave Gaz Dolum hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "buzusme",
                title: "Büzüşme Tankı",
                description: "Büzüşme Tankı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "psikrometri",
                title: "Psikrometrik Hesaplar",
                description: "Psikrometrik Hesaplar hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "sehir",
                title: "Şehir İklim Verileri",
                description: "Şehir İklim Verileri hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "havalandirma_tesisati",
        title: "Havalandırma Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
        calculators: [
            {
                id: "havadebisi",
                title: "Taze Hava Debisi",
                description: "Taze Hava Debisi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "siginak",
                title: "Sığınak Debisi",
                description: "Sığınak Debisi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "otopark",
                title: "Otopark Debisi",
                description: "Otopark Debisi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "kanal",
                title: "Hava Kanal Basınç Kaybı",
                description: "Hava Kanal Basınç Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "klimasantrali",
                title: "Klima Santrali Hesabı",
                description: "Klima Santrali Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "klimasantralikontrol",
                title: "Klima Santrali Kapasite Kontrolü",
                description: "Klima Santrali Kapasite Kontrolü hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "hrv",
                title: "HRV Cihazı",
                description: "HRV Cihazı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "adyabatik",
                title: "Adyabatik Hava Karışımı",
                description: "Adyabatik Hava Karışımı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "evaporatif",
                title: "Evaporatif Serinletme",
                description: "Evaporatif Serinletme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "davlumbaz",
                title: "Pratik Davlumbaz Hesabı",
                description: "Pratik Davlumbaz Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "davlumbaz16282",
                title: "TS 16282 Davlumbaz Hesabi",
                description: "TS 16282 Davlumbaz Hesabi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "sihhi_tesisat",
        title: "Sıhhi Tesisat",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>',
        calculators: [
            {
                id: "subasinc",
                title: "Su Basınç Kaybı",
                description: "Su Basınç Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "din1988su",
                title: "DIN 1988 Su Basınç Kaybı",
                description: "DIN 1988 Su Basınç Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "din1988sicaksu",
                title: "DIN 1988 Sıcak Su Basınç Kaybı",
                description: "DIN 1988 Sıcak Su Basınç Kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "hidrofor",
                title: "Hidrofor",
                description: "Hidrofor hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "sudeposu",
                title: "Su Deposu",
                description: "Su Deposu hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "boyler",
                title: "Boyler",
                description: "Boyler hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "suyumusatma",
                title: "Su Yumuşatma",
                description: "Su Yumuşatma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yagmur",
                title: "Yağmur Suyu Boru Çapı",
                description: "Yağmur Suyu Boru Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "atiksucap",
                title: "SB Atık Su Boru Çapı",
                description: "SB Atık Su Boru Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yagmuratiksucap",
                title: "DO Yağmur ve Atık Su Boru Çapı",
                description: "DO Yağmur ve Atık Su Boru Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "pissupompa",
                title: "Pissu Pompa",
                description: "Pissu Pompa hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "fosseptik",
                title: "Fosseptik",
                description: "Fosseptik hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yag",
                title: "Yağ Ayırıcı",
                description: "Yağ Ayırıcı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "gunes_enerjisi_tesisati",
        title: "Güneş Enerjisi Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
        calculators: [
            {
                id: "gunespaneli",
                title: "Pratik Güneş Paneli",
                description: "Pratik Güneş Paneli hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "gunespaneli15316",
                title: "TS 15316 Güneş Paneli",
                description: "TS 15316 Güneş Paneli hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "gunesgenlesme",
                title: "Güneş Paneli Genleşme Tankı",
                description: "Güneş Paneli Genleşme Tankı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "havuz_tesisati",
        title: "Havuz Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>',
        calculators: [
            {
                id: "havuzfiltrasyon",
                title: "Havuz Filtrasyon Hesabı",
                description: "Havuz Filtrasyon Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "havuzisi",
                title: "Havuz Suyu Isıtma",
                description: "Havuz Suyu Isıtma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "havuzhava",
                title: "Havuz Taze Hava Debisi",
                description: "Havuz Taze Hava Debisi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "havuznemalma",
                title: "Havuz Nem Alma Santrali Hesabı",
                description: "Havuz Nem Alma Santrali Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "yangin_tesisati",
        title: "Yangın Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 0-4 3-4 7s2 5 2 7-1 3-1 3 3-2 3-5-2-4-2-6 2-3 2-3z"></path></svg>',
        calculators: [
            {
                id: "sprinkler",
                title: "Sprinkler Hidrolik Hesabı",
                description: "Sprinkler Hidrolik Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yangindolab",
                title: "Yangın Dolabı Hesabı",
                description: "Yangın Dolabı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "hidrant",
                title: "Hidrant Hesabı",
                description: "Hidrant Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "yangin",
                title: "Pratik Sprink, Dolap, Hidrant Hesabı",
                description: "Pratik Sprink, Dolap, Hidrant Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "merdivenbasinclama",
                title: "Merdiven Basınçlandırma",
                description: "Merdiven Basınçlandırma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "asansorbasinclama",
                title: "Asansör Kuyusu Basınçlandırma",
                description: "Asansör Kuyusu Basınçlandırma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "fm200",
                title: "FM200 Gazlı Söndürme",
                description: "FM200 Gazlı Söndürme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "novec1230",
                title: "Novec 1230 Gazlı Söndürme",
                description: "Novec 1230 Gazlı Söndürme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "co2",
                title: "CO2 Gazlı Söndürme",
                description: "CO2 Gazlı Söndürme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "davlumbazsondurme",
                title: "Davlumbaz Söndürme",
                description: "Davlumbaz Söndürme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "dogalgaz_tesisati",
        title: "Doğalgaz Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>',
        calculators: [
            {
                id: "21mbar",
                title: "21 mbar Basınç kaybı",
                description: "21 mbar Basınç kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "50mbar",
                title: "50 mbar Basınç kaybı",
                description: "50 mbar Basınç kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "300mbar",
                title: "300 mbar Basınç kaybı",
                description: "300 mbar Basınç kaybı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "altust",
                title: "Alt ve Üst Havalandırma",
                description: "Alt ve Üst Havalandırma hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "baca",
                title: "Pratik Baca Çapı",
                description: "Pratik Baca Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "ts13384baca",
                title: "TS 13384-1 Baca Çapı",
                description: "TS 13384-1 Baca Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "ts13384hermetikbaca",
                title: "TS 13384-1 Hermetik Baca Çapı",
                description: "TS 13384-1 Hermetik Baca Çapı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "asansor_tesisati",
        title: "Asansör Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5l-5-3-5 3M17 19l-5 3-5-3"></path></svg>',
        calculators: [
            {
                id: "asansortrafik",
                title: "Asansör Trafik Hesabı",
                description: "Asansör Trafik Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "asansorkuvvet",
                title: "Asansör Kuvvet Hesabı",
                description: "Asansör Kuvvet Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "basincli_hava_tesisati",
        title: "Basınçlı Hava Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        calculators: [
            {
                id: "basinclihavaborucap",
                title: "Boru Çapı Hesabı",
                description: "Boru Çapı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "basinclihavaborubasinc",
                title: "Boru Basınç Kaybı Hesabı",
                description: "Boru Basınç Kaybı Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "elektrik_tesisati",
        title: "Elektrik Tesisatı",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
        calculators: [
            {
                id: "elektriktuketim",
                title: "Elektrik Tüketim Hesabı",
                description: "Elektrik Tüketim Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "aydinlatma",
                title: "Aydınlatma Hesabı",
                description: "Aydınlatma Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "jenerator",
                title: "Jeneratör Hesabı",
                description: "Jeneratör Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "kablokesit",
                title: "Kablo Kesit Hesabı",
                description: "Kablo Kesit Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "gerilim",
                title: "Gerilim Düşümü Hesabı",
                description: "Gerilim Düşümü Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "akimsigorta",
                title: "Aktif Güce Göre Akım ve Sigorta",
                description: "Aktif Güce Göre Akım ve Sigorta hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "aktifguc",
                title: "Aktif Güç Hesabı",
                description: "Aktif Güç Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "gorunurguc",
                title: "Görünür Güç Hesabı",
                description: "Görünür Güç Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "reaktifguc",
                title: "Reaktif Güç Hesabı",
                description: "Reaktif Güç Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "kompanzasyon",
                title: "Kompanzasyon Hesabı",
                description: "Kompanzasyon Hesabı hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "salter",
                title: "Trafo Gücüne Göre Şalter",
                description: "Trafo Gücüne Göre Şalter hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "bakir",
                title: "Bakır Çubuk Ağırlık",
                description: "Bakır Çubuk Ağırlık hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "direkyol",
                title: "Direk Yol Verme",
                description: "Direk Yol Verme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "ucgenyol",
                title: "Yıldız Üçgen Yol Verme",
                description: "Yıldız Üçgen Yol Verme hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "bakirkilo",
                title: "Bakır Lama Uzunluğa Göre Kilo",
                description: "Bakır Lama Uzunluğa Göre Kilo hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "bakiruzunluk",
                title: "Bakır Lama Kiloya Göre Uzunluk",
                description: "Bakır Lama Kiloya Göre Uzunluk hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    },
    {
        id: "yardimci_araclar",
        title: "Yardımcı Araçlar",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
        calculators: [
            {
                id: "unit",
                title: "Birim Çevir",
                description: "Birim Çevir hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "hesap",
                title: "Bilimsel Hesap Makinesi",
                description: "Bilimsel Hesap Makinesi hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "colebrookwhite",
                title: "Colebrook White Sürtünme Faktörü",
                description: "Colebrook White Sürtünme Faktörü hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "gucdonusum",
                title: "Elektrik Güç Dönüşümleri",
                description: "Elektrik Güç Dönüşümleri hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "su",
                title: "Su Özellikleri",
                description: "Su Özellikleri hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "mmo",
                title: "Mekanik Tesisat Proje Bedeli",
                description: "Mekanik Tesisat Proje Bedeli hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            },
            {
                id: "mesafe",
                title: "Şehirler Arası Mesafe",
                description: "Şehirler Arası Mesafe hesabı yapmak için gerekli değerleri girin.",
                inputs: [
                          {
                                    "id": "deger1",
                                    "label": "Değer 1",
                                    "type": "number",
                                    "placeholder": "Örn: 10",
                                    "required": true
                          },
                          {
                                    "id": "deger2",
                                    "label": "Değer 2",
                                    "type": "number",
                                    "placeholder": "Örn: 20",
                                    "required": true
                          }
                ],
                outputs: [
                          {
                                    "id": "sonuc",
                                    "label": "Sonuç",
                                    "unit": "Birim"
                          }
                ],
                calculate: (values) => {
                    const { deger1, deger2 } = values;
                    return { sonuc: (deger1 + deger2).toFixed(2) };
                }
            }
        ]
    }
];
