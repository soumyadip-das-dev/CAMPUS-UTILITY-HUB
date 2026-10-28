import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

js_files = ['js/app.js', 'js/modules/existing-utilities.js']
referenced_ids = set()
for path in js_files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", content)
    referenced_ids.update(matches)

missing = []
for id_name in sorted(referenced_ids):
    if f'id="{id_name}"' not in html and f"id='{id_name}'" not in html:
        missing.append(id_name)

print(f"Checked {len(referenced_ids)} IDs.")
if missing:
    print(f"Missing IDs in index.html: {missing}")
else:
    print("All referenced element IDs successfully exist in index.html!")
