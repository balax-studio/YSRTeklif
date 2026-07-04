import customtkinter as ctk
import sys
import os

# Set UI Theme to match Web aesthetics
BG_COLOR = "#080810"
CARD_COLOR = "#0e0e1b"
BORDER_COLOR = "#27272a"
PRIMARY_COLOR = "#6366f1"
PRIMARY_HOVER = "#4f46e5"
TEXT_COLOR = "#fafafa"
TEXT_MUTED = "#a1a1aa"

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# Append current dir to path to import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from modules.boq_parser import BOQParserModule

class YSRSmartEngineApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("YSR Smart Engine - Akıllı Modüller")
        self.geometry("1100x700")
        self.configure(fg_color=BG_COLOR)
        
        # Grid layout (Sidebar on left, Main content on right)
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # Build Sidebar
        self.sidebar_frame = ctk.CTkFrame(self, fg_color=CARD_COLOR, corner_radius=0, width=250, border_color=BORDER_COLOR, border_width=1)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(4, weight=1) # Push bottom content down

        self.logo_label = ctk.CTkLabel(self.sidebar_frame, text="YSR Smart Engine", 
                                       font=ctk.CTkFont(size=20, weight="bold"), text_color=PRIMARY_COLOR)
        self.logo_label.grid(row=0, column=0, padx=20, pady=(30, 30))

        # Build Main Content Area
        self.main_content_frame = ctk.CTkFrame(self, fg_color=BG_COLOR, corner_radius=0)
        self.main_content_frame.grid(row=0, column=1, sticky="nsew")
        
        # Load Modules dynamically (Plugin Architecture)
        self.modules = {}
        self.active_module = None
        
        self._load_modules()
        
        # Select first module by default
        if self.modules:
            first_module_name = list(self.modules.keys())[0]
            self.switch_module(first_module_name)

    def _load_modules(self):
        """
        Loads all plugins derived from BaseModule.
        For now, we manually register BOQParserModule. 
        In the future, this can use importlib to auto-discover .py files in modules/.
        """
        # Instantiate modules
        boq_module = BOQParserModule(self)
        
        # Register them
        self._register_module(boq_module)
        
    def _register_module(self, module_obj):
        name = module_obj.module_name
        self.modules[name] = module_obj
        
        # Create a container frame for this module in main_content_frame
        module_frame = ctk.CTkFrame(self.main_content_frame, fg_color="transparent")
        module_obj.frame = module_frame # Attach frame to module obj
        module_obj.build_ui(module_frame)
        
        # Create a sidebar button for this module
        row_idx = len(self.modules) # 1-indexed because row 0 is logo
        btn = ctk.CTkButton(self.sidebar_frame, text=name,
                            fg_color="transparent", text_color=TEXT_COLOR,
                            hover_color="#1a1a2e", font=ctk.CTkFont(size=14, weight="bold"),
                            anchor="w", height=40, command=lambda m=name: self.switch_module(m))
        btn.grid(row=row_idx, column=0, padx=15, pady=5, sticky="ew")
        
        module_obj.sidebar_btn = btn

    def switch_module(self, module_name):
        if self.active_module == module_name:
            return
            
        # Hide current module
        if self.active_module:
            prev_mod = self.modules[self.active_module]
            prev_mod.frame.pack_forget()
            prev_mod.sidebar_btn.configure(fg_color="transparent", text_color=TEXT_COLOR)
            prev_mod.on_hide()
            
        # Show new module
        self.active_module = module_name
        new_mod = self.modules[module_name]
        new_mod.frame.pack(fill="both", expand=True)
        new_mod.sidebar_btn.configure(fg_color=PRIMARY_COLOR, text_color="#ffffff")
        new_mod.on_show()


if __name__ == "__main__":
    app = YSRSmartEngineApp()
    app.mainloop()
