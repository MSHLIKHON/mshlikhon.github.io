"""Generate the static GitHub Pages routes from one shared portfolio template."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
source = (root / 'templates/page.html').read_text()
start = source.index('  <main id="main-content">')
end = source.index('  </main>', start) + len('  </main>')
main = source[start:end]
sections = {}
depth = 0
for token in re.finditer(r'<(/?)section\b[^>]*>', main):
    if not token[1]:
        if depth == 0:
            section_start = token.start()
            key = re.search(r'\bid="([^"]+)"', token[0])[1]
        depth += 1
    else:
        depth -= 1
        if depth == 0: sections[key] = main[section_start:token.end()]
names = {'home':'Home','about':'About','projects':'Projects','github':'GitHub','games':'Arcade','skills':'Skills','education':'Education','leadership':'Leadership','contact':'Contact'}
for key, section in sections.items():
    path = 'index.html' if key == 'home' else key + '.html'
    breadcrumb = '' if key == 'home' else f'<div class="page-trail"><a href="index.html">Home</a><span aria-hidden="true">/</span><span>{names[key]}</span></div>'
    html = source[:start] + f'<main id="main-content">{breadcrumb}\n{section}\n</main>' + source[end:]
    html = html.replace('<body>', f'<body data-page="{key}">')
    for route in sections:
        html = html.replace(f'href="#{route}"', 'href="' + ('index.html' if route == 'home' else route + '.html') + '"')
    html = html.replace(f'<a href="{path}">{names[key] if key != "games" else "Games"}</a>', f'<a href="{path}" aria-current="page" class="active">{names[key] if key != "games" else "Games"}</a>')
    url = 'https://mshlikhon.github.io/' + ('' if key == 'home' else path)
    html = re.sub(r'(<link rel="canonical" href=")[^"]+', lambda m:m[1]+url, html)
    html = re.sub(r'(<meta property="og:url" content=")[^"]+', lambda m:m[1]+url, html)
    if key != 'home':
        html = re.sub(r'  <link rel="preload"[^>]*>\n', '', html)
        title = f'{names[key]} | Md. Shyed Hasan Likhon'
        html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html)
        html = re.sub(r'(<meta (?:property="og:title"|name="twitter:title") content=")[^"]+', lambda m:m[1]+title, html)
        html = re.sub(r'  <div class="site-intro".*?\n  </div>\n', '', html, flags=re.S)
    if key not in ('games','projects'):
        html = html.replace('  <script defer src="assets/games.js?v=tetris-20261119"></script>','')
    if key != 'skills': html = html.replace('  <script defer src="assets/playground.js?v=pages-20261119"></script>','')
    if key == 'games': html = html.replace('  <script defer src="assets/games.js?v=tetris-20261119"></script>', '  <script defer src="assets/games.js?v=tetris-20261119"></script>\n  <script defer src="assets/tetris.js"></script>')
    (root/path).write_text(html)
urls = ['https://mshlikhon.github.io/' + ('' if k == 'home' else k + '.html') for k in sections]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{url}</loc></url>\n' for url in urls)+'</urlset>\n')
print('Generated', len(sections), 'pages.')
