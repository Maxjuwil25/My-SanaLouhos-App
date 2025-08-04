# filter_common_fi.py

#!/usr/bin/env python3
import json
import re

# 1) Load your top-2000 word list (entries like "word 12345")
with open('common_fi_top2000.json', encoding='utf8') as f:
    raw_entries = json.load(f)

# 2) Load and clean the names file (format: "Name<TAB>Frequency")
names = set()
with open('finnish_names.txt', encoding='utf8') as f:
    for line in f:
        parts = line.strip().split()
        if parts:
            names.add(parts[0].lower())

# 3) Define a regex for common Finnish inflectional endings
INFLECT_SUFFIXES = r'(ssa|stä|sta|lle|lla|lle|ksi|n|t)$'
INFLECT = re.compile(r'.*' + INFLECT_SUFFIXES, re.IGNORECASE)

# 4) Process each entry: split off frequency, filter names and inflections
clean = []
for entry in raw_entries:
    # Split on whitespace to separate word from its frequency
    word = entry.strip().split()[0].lower()
    if not word:
        continue

    # 4a) Filter out names
    if word in names:
        continue

    # 4b) Filter out obvious inflected forms
    if INFLECT.match(word):
        continue

    clean.append(word)

# 5) Save the cleaned list
with open('common_fi_clean.json', 'w', encoding='utf8') as f:
    json.dump(clean, f, ensure_ascii=False, indent=2)

print(f"Cleaned list has {len(clean)} words (from {len(raw_entries)} raw entries).")
