from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
css = (root / 'assets/styles.css').read_text()
html = html.replace('<link rel="stylesheet" href="assets/styles.css">', '<style>\n' + css + '\n</style>')
icon = (root / 'assets/icon.svg').read_text()
from urllib.parse import quote
html = html.replace('href="assets/icon.svg"', 'href="data:image/svg+xml,' + quote(icon, safe='') + '"')
scripts = []
for filename in ('finance.js', 'app.js'):
    html = html.replace(f'<script defer src="assets/{filename}"></script>', '')
    scripts.append('<script>\n' + (root / 'assets' / filename).read_text() + '\n</script>')
html = html.replace('</body>', '\n'.join(scripts) + '\n</body>')
(root / 'Rumbo.html').write_text(html)
print('Rumbo.html generado')
