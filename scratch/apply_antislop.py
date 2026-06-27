import re
import os

html_path = r'c:\Users\YSR_MONSTER\.antigravity\YSR Teklif Takip\index.html'
css_path = r'c:\Users\YSR_MONSTER\.antigravity\YSR Teklif Takip\css\style.css'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace floatPulse animation
html = re.sub(
    r'\.empty-state-svg\s*\{\s*animation:\s*floatPulse\s+3s\s+ease-in-out\s+infinite;\s*\}\s*@keyframes\s+floatPulse\s*\{[\s\S]*?\}',
    '.empty-state-svg {\n    transition: transform 0.15s cubic-bezier(0, 1, 0, 1);\n  }\n  .empty-state-svg:hover {\n    transform: rotate(4deg) scale(1.05);\n  }',
    html
)

# Replace all stroke-width="2" and stroke-width="2.5" with "1.5"
html = re.sub(r'stroke-width="2(?:\.5)?"', 'stroke-width="1.5"', html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Make transitions snappier and mechanical
css = re.sub(
    r'transition:\s*background-color\s*0\.2s\s*cubic-bezier[\s\S]*?box-shadow\s*0\.2s\s*cubic-bezier[^;]*;',
    'transition: background-color 0.1s cubic-bezier(0, 1, 0, 1), border-color 0.1s cubic-bezier(0, 1, 0, 1), color 0.1s cubic-bezier(0, 1, 0, 1), transform 0.1s cubic-bezier(0, 1, 0, 1), box-shadow 0.1s cubic-bezier(0, 1, 0, 1);',
    css
)

css = re.sub(
    r'letter-spacing:\s*-0\.015em;',
    'letter-spacing: -0.03em;',
    css
)

# Light theme colors
css = re.sub(
    r'--bg:\s*#f8fafc;\s*--card:\s*#ffffff;\s*--border:\s*#e2e8f0;\s*--text:\s*#0f172a;\s*--text2:\s*#475569;\s*--text3:\s*#94a3b8;',
    '--bg: #f4f4f5;\n    --card: #ffffff;\n    --border: #d4d4d8;\n    --text: #09090b;\n    --text2: #52525b;\n    --text3: #a1a1aa;',
    css
)

# Dark theme colors
css = re.sub(
    r'--bg:\s*#030712;\s*--card:\s*#0b0f19;\s*--border:\s*rgba\(255,\s*255,\s*255,\s*0\.07\);\s*--text:\s*#f8fafc;\s*--text2:\s*#94a3b8;\s*--text3:\s*#4b5563;',
    '--bg: #000000;\n    --card: #09090b;\n    --border: #27272a;\n    --text: #fafafa;\n    --text2: #a1a1aa;\n    --text3: #71717a;',
    css
)

# Stat card border snap
css = re.sub(
    r'\.stat-card::before\s*\{\s*content:\s*\'\';\s*position:\s*absolute;\s*top:\s*0;\s*left:\s*0;\s*width:\s*4px;\s*height:\s*100%;\s*background:\s*var\(--primary\);\s*opacity:\s*0;\s*transition:\s*opacity\s*0\.3s;\s*\}',
    '.stat-card::before {\n    content: \'\';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 4px;\n    height: 100%;\n    background: var(--primary);\n    opacity: 0;\n    transition: none;\n  }',
    css
)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("Updates applied successfully.")
