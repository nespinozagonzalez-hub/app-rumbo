from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
css = (root / 'assets/styles.css').read_text()
html = re.sub(r'<link rel="stylesheet" href="assets/styles\.css[^"]*">', lambda _: '<style>\n' + css + '\n</style>', html)
icon = (root / 'assets/icon.svg').read_text()
from urllib.parse import quote
html = html.replace('href="assets/icon.svg"', 'href="data:image/svg+xml,' + quote(icon, safe='') + '"')
scripts = []
for filename in ('finance.js', 'app.js'):
    html = re.sub(r'<script defer src="assets/' + re.escape(filename) + r'[^"]*"></script>', '', html)
    scripts.append('<script>\n' + (root / 'assets' / filename).read_text() + '\n</script>')
html = html.replace('</body>', '\n'.join(scripts) + '\n</body>')
(root / 'Rumbo.html').write_text(html)
print('Rumbo.html generado')
