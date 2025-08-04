#!/usr/bin/env python3
import json
import re

# 1) Load the already cleaned list
with open('common_fi_clean.json', 'r', encoding='utf8') as f:
    words = json.load(f)

# 2) Define suffixes to drop: "mme" and "tko"
SUFFIX_PATTERN = re.compile(r'.*(mme|tko|sti|ii|ua|ani|iä|aa|ia|ää|tkö|ee|oi|ui|yy|ee|lta|llä|nsä|yi|ltä|na|nä|ni|si|nsa|nsä|nko|nkö|ttä|tta|ssa|ssä|rrä|rra|ta|tä|ko|kö|uu)$', re.IGNORECASE)

# 3) Filter out words matching those endings
filtered_words = [w for w in words if not SUFFIX_PATTERN.match(w)]

# 4) Write the further-cleaned list
with open('common_fi_clean.json', 'w', encoding='utf8') as f:
    json.dump(filtered_words, f, ensure_ascii=False, indent=2)

print(f"Removed {len(words) - len(filtered_words)} words; {len(filtered_words)} remain.")
