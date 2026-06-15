import os
import re

frontend_dir = r"c:\Users\guilherme.oliveira\aimsync-sgc\frontend"

html_files = [f for f in os.listdir(frontend_dir) if f.endswith('.html')]

for filename in html_files:
    filepath = os.path.join(frontend_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # regex to find links to blocked pages inside the sidebar-nav
    # It might be simpler to just find the specific anchor tags
    
    blocked_pages = ['dashboard.html', 'relatorios.html', 'equipe.html', 'configuracoes.html']
    
    for page in blocked_pages:
        # Looking for something like <a href="dashboard.html"
        # and replace with <a href="dashboard.html" data-admin-only
        pattern = rf'(<a[^>]*href=["\']{page}["\'][^>]*)>'
        
        def replacer(match):
            tag = match.group(1)
            if 'data-admin-only' not in tag:
                return tag + ' data-admin-only>'
            return match.group(0)
            
        new_content, count = re.subn(pattern, replacer, content)
        if count > 0:
            content = new_content
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
