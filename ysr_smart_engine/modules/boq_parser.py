import os
import pandas as pd
import customtkinter as ctk
import tkinter.filedialog as fd

# Local imports
from .base_module import BaseModule

class BOQParserModule(BaseModule):
    module_name = "BOQ Analizi"
    is_visible = True

    def __init__(self, app_context):
        super().__init__(app_context)
        self.output_textbox = None
        self.status_label = None

    def build_ui(self, parent_frame: ctk.CTkFrame):
        # UI Colors matching the new theme
        BG_COLOR = "#080810"
        CARD_COLOR = "#0e0e1b"
        PRIMARY_COLOR = "#6366f1"
        PRIMARY_HOVER = "#4f46e5"
        TEXT_COLOR = "#fafafa"
        TEXT_MUTED = "#a1a1aa"

        parent_frame.grid_columnconfigure(0, weight=1)
        parent_frame.grid_rowconfigure(3, weight=1)
        
        # Title
        title_label = ctk.CTkLabel(parent_frame, text="Akıllı BOQ Ayrıştırıcı", 
                                   font=ctk.CTkFont(size=26, weight="bold"), text_color=TEXT_COLOR)
        title_label.grid(row=0, column=0, pady=(20, 5), padx=30, sticky="w")
        
        # Description
        desc_label = ctk.CTkLabel(parent_frame, 
                                  text="Mekanik tesisat projeleriniz için Excel (.xlsx) keşif özetinizi seçin.\nModül sayfaları ayırarak analiz edecektir.", 
                                  font=ctk.CTkFont(size=14), text_color=TEXT_MUTED, justify="left")
        desc_label.grid(row=1, column=0, pady=(0, 20), padx=30, sticky="w")
        
        # Controls Frame
        controls_frame = ctk.CTkFrame(parent_frame, fg_color="transparent")
        controls_frame.grid(row=2, column=0, pady=10, padx=30, sticky="ew")
        
        upload_btn = ctk.CTkButton(controls_frame, text="Excel Dosyası Seç", 
                                   fg_color=PRIMARY_COLOR, hover_color=PRIMARY_HOVER,
                                   font=ctk.CTkFont(weight="bold", size=14),
                                   height=45, width=200, command=self.select_file)
        upload_btn.pack(side="left")
        
        self.status_label = ctk.CTkLabel(controls_frame, text="", font=ctk.CTkFont(size=13), text_color=TEXT_COLOR)
        self.status_label.pack(side="left", padx=20)
        
        # Results Textbox
        self.output_textbox = ctk.CTkTextbox(parent_frame, fg_color=CARD_COLOR, text_color=TEXT_COLOR, 
                                             border_color="#27272a", border_width=1, corner_radius=12)
        self.output_textbox.grid(row=3, column=0, pady=(10, 30), padx=30, sticky="nsew")

    def select_file(self):
        filetypes = (('Excel files', '*.xlsx *.xls'), ('All files', '*.*'))
        filename = fd.askopenfilename(title='BOQ Dosyası Seçin', initialdir='/', filetypes=filetypes)
        
        if filename:
            self.status_label.configure(text=f"İşleniyor: {os.path.basename(filename)}", text_color="#a1a1aa")
            self.app_context.update()
            
            try:
                sheets_data = self._parse_boq_file(filename)
                
                self.output_textbox.delete("0.0", "end")
                self.output_textbox.insert("0.0", f"Başarıyla ayrıştırıldı: {os.path.basename(filename)}\n")
                self.output_textbox.insert("end", f"Bulunan Sayfalar: {', '.join(sheets_data.keys())}\n\n")
                
                for sheet_name, df in sheets_data.items():
                    headers, rows = self._format_dataframe_for_preview(df)
                    self.output_textbox.insert("end", f"--- {sheet_name.upper()} ---\n")
                    self.output_textbox.insert("end", f"Satır Sayısı: {len(rows)}\n")
                    self.output_textbox.insert("end", f"Sütunlar: {', '.join([str(h) for h in headers])}\n\n")
                    
                self.status_label.configure(text=f"Analiz Tamamlandı. ({len(sheets_data)} sayfa bulundu)", text_color="#34d399") # green
                
            except Exception as e:
                self.status_label.configure(text=f"Hata: {str(e)}", text_color="#f87171") # red

    def _parse_boq_file(self, file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dosya bulunamadı: {file_path}")
        try:
            xls = pd.ExcelFile(file_path)
            sheets_data = {}
            for sheet_name in xls.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet_name).dropna(how='all').dropna(axis=1, how='all')
                sheets_data[sheet_name] = df
            return sheets_data
        except Exception as e:
            raise Exception(f"Excel ayrıştırılırken hata oluştu: {str(e)}")

    def _format_dataframe_for_preview(self, df):
        df = df.fillna("")
        return list(df.columns), df.values.tolist()
