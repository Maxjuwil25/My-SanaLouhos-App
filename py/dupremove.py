# remove_duplicates.py

#!/usr/bin/env python3
import json

# 1) Load the JSON file containing your word list.
#    Replace 'words.json' with your actual filename if different.
with open('words.json', 'r', encoding='utf8') as f:
    words = json.load(f)

# 2) Remove duplicates while preserving original order
seen = set()
unique_words = []
for word in words:
    if word not in seen:
        unique_words.append(word)
        seen.add(word)

# 3) Overwrite the original file (or change filename to write new file)
with open('words.json', 'w', encoding='utf8') as f:
    json.dump(unique_words, f, ensure_ascii=False, indent=2)

# 4) Report results
print(f"Removed {len(words) - len(unique_words)} duplicate entries.")
print(f"{len(unique_words)} unique words remain in 'words.json'.")

