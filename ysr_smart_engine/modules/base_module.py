import customtkinter as ctk

class BaseModule:
    """
    Tüm 'Akıllı Modülasyon' eklentilerinin türetileceği temel sınıf.
    Yeni bir modül eklerken bu sınıftan kalıtım alıp gerekli metodları ezmeniz yeterlidir.
    """
    
    # Modülün arayüzde (sol menüde) görünecek adı
    module_name = "Base Module"
    
    # Modül menüde görünmeli mi?
    is_visible = True

    def __init__(self, app_context):
        """
        app_context: Ana uygulamanın (main.py) referansını tutar,
                     böylece modüller ana pencereyle veya diğer durumlarla haberleşebilir.
        """
        self.app_context = app_context

    def build_ui(self, parent_frame: ctk.CTkFrame):
        """
        Bu metod her modül için ezilmelidir (override).
        Modülün arayüzünü (butonlar, yazılar, listeler vs.) `parent_frame` içerisine çizer.
        """
        title = ctk.CTkLabel(parent_frame, text=self.module_name, 
                             font=ctk.CTkFont(size=24, weight="bold"), text_color="#FFFFFF")
        title.pack(pady=20, padx=20, anchor="w")
        
        info = ctk.CTkLabel(parent_frame, text="Bu modül henüz bir UI tanımlamamış.", 
                            text_color="#A1A1AA")
        info.pack(pady=10, padx=20, anchor="w")

    def on_show(self):
        """
        Kullanıcı menüden bu modüle tıkladığında ve modül ekrana geldiğinde çağrılır.
        Yenilenmesi gereken veriler varsa burada tetiklenebilir.
        """
        pass

    def on_hide(self):
        """
        Kullanıcı başka bir modüle geçtiğinde çağrılır.
        """
        pass
