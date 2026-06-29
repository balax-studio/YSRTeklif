import time
import sys
import os

try:
    import win32gui
    import win32con
    import win32api
    import win32ui
except ImportError:
    print("Gerekli kütüphaneler bulunamadı. Lütfen terminale şu komutu yazarak kurun:")
    print("pip install pywin32")
    sys.exit(1)

PROJECT_TITLE_SUBSTRING = "ysr teklif"  # Proje başlığında geçen kelime
IDE_TITLE_KEYWORDS = ["code", "visual studio", "antigravity", "cursor"]  # IDE olduğunu doğrulayan kelimeler
CHECK_INTERVAL = 1.0  # Saniyede bir kontrol et.

def find_vscode_hwnd():
    hwnd_list = []
    
    def enum_windows_callback(hwnd, extra):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd).lower()
            # Proje adını içermeli VE bir IDE penceresi olmalı (tarayıcı sekmelerini elemek için)
            if PROJECT_TITLE_SUBSTRING in title:
                if any(kw in title for kw in IDE_TITLE_KEYWORDS):
                    hwnd_list.append(hwnd)
        return True

    win32gui.EnumWindows(enum_windows_callback, None)
    return hwnd_list[0] if hwnd_list else None

def find_and_click_blue_button(hwnd):
    try:
        rect = win32gui.GetWindowRect(hwnd)
        w = rect[2] - rect[0]
        h = rect[3] - rect[1]
        
        hwndDC = win32gui.GetWindowDC(hwnd)
        mfcDC  = win32ui.CreateDCFromHandle(hwndDC)
        saveDC = mfcDC.CreateCompatibleDC()
        
        saveBitMap = win32ui.CreateBitmap()
        saveBitMap.CreateCompatibleBitmap(mfcDC, w, h)
        saveDC.SelectObject(saveBitMap)
        
        import ctypes
        result = ctypes.windll.user32.PrintWindow(hwnd, saveDC.GetSafeHdc(), 2)
        
        if result:
            # Gelişmiş Tarama Alanı (Yüksek DPI ve farklı ekran ölçeklendirmeleri destekler)
            # Sağdan 300 piksel, alttan 250 ile 40 piksel aralığını tarar.
            start_x = max(0, w - 300)
            end_x = min(w - 15, w - 1)
            start_y = max(0, h - 250)
            end_y = min(h - 40, h - 1)
            
            for y in range(start_y, end_y + 1):
                for x in range(start_x, end_x + 1):
                    color = saveDC.GetPixel(x, y)
                    r = color & 0xff
                    g = (color >> 8) & 0xff
                    b = (color >> 16) & 0xff
                    
                    # Genişletilmiş renk algılama (Klasik VS Code mavisi ve modern Indigo/Mor temaları destekler)
                    if b > 130 and r < 120 and b > r + 30:
                        # Butonlar katı bloklardır. Pikselin 5x5 çevresini doğrula (Metin veya ince çizgileri atla)
                        is_solid_block = True
                        for check_y in range(y, min(y + 5, end_y + 1)):
                            for check_x in range(x, min(x + 5, end_x + 1)):
                                n_color = saveDC.GetPixel(check_x, check_y)
                                nr = n_color & 0xff
                                ng = (n_color >> 8) & 0xff
                                nb = (n_color >> 16) & 0xff
                                if not (nb > 120 and nr < 130 and nb > nr + 25):
                                    is_solid_block = False
                                    break
                            if not is_solid_block:
                                break
                                
                        if is_solid_block:
                            # Kaynakları temizle
                            win32gui.DeleteObject(saveBitMap.GetHandle())
                            saveDC.DeleteDC()
                            mfcDC.DeleteDC()
                            win32gui.ReleaseDC(hwnd, hwndDC)
                            
                            print(f"[{time.strftime('%H:%M:%S')}] Onay butonu bloğu algılandı ({x}, {y}) [RGB: {r},{g},{b}]. Tıklanıyor...")
                            click_active(hwnd, x + 2, y + 2)
                            return True
            
            if int(time.time()) % 5 == 0:
                print(f"[{time.strftime('%H:%M:%S')}] Sağ alt alan taranıyor - Buton bulunamadı.")
                
        # Kaynakları temizle
        win32gui.DeleteObject(saveBitMap.GetHandle())
        saveDC.DeleteDC()
        mfcDC.DeleteDC()
        win32gui.ReleaseDC(hwnd, hwndDC)
        return False
    except Exception as e:
        if int(time.time()) % 5 == 0:
            print(f"HATA find_and_click_blue_button: {e}")
        return False

def click_active(hwnd, x, y):
    try:
        # Mevcut mouse konumunu kaydet
        orig_x, orig_y = win32api.GetCursorPos()
        
        # Pencereyi aktif hale getir (Electron arka plan tıklamalarını yoksayar)
        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
        win32gui.SetForegroundWindow(hwnd)
        time.sleep(0.05)
        
        # Pencere koordinatlarını ekran koordinatına çevir
        rect = win32gui.GetWindowRect(hwnd)
        global_x = rect[0] + x
        global_y = rect[1] + y
        
        # İmleci taşı ve tıkla
        win32api.SetCursorPos((global_x, global_y))
        win32api.mouse_event(win32con.MOUSEEVENTF_LEFTDOWN, global_x, global_y, 0, 0)
        time.sleep(0.05)
        win32api.mouse_event(win32con.MOUSEEVENTF_LEFTUP, global_x, global_y, 0, 0)
        
        # Mouse imlecini eski yerine anında geri taşı
        time.sleep(0.05)
        win32api.SetCursorPos((orig_x, orig_y))
    except Exception as e:
        print(f"Tıklama hatası: {e}")

def main():
    print("Windows Auto-Accept Bot (Gelişmiş Aktif Tıklama) başlatılıyor...")
    print(f"Takip edilen başlık: '{PROJECT_TITLE_SUBSTRING}' ve IDE kelimeleri.")
    print("Çıkış için CTRL+C tuşlarına basın.\n")

    try:
        while True:
            hwnd = find_vscode_hwnd()
            if hwnd:
                if not win32gui.IsIconic(hwnd):
                    # Alan içinde mavi/indigo butonu bul ve tıkla
                    if find_and_click_blue_button(hwnd):
                        time.sleep(1.5) # Çift tıklamayı önlemek için bekle
            else:
                if int(time.time()) % 5 == 0:
                    print(f"[{time.strftime('%H:%M:%S')}] IDE penceresi bulunamadı. Lütfen '{PROJECT_TITLE_SUBSTRING}' projesinin açık olduğundan emin olun.")
            
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("\nBot durduruldu. İyi günler!")

if __name__ == "__main__":
    main()
