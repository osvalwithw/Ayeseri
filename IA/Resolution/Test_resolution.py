# kb_test.py
import json, sys
from difflib import get_close_matches
 
KB_PATH = "resolution_cook_book.json"  # cambia si tu archivo se llama distinto
 
with open(KB_PATH, "r", encoding="utf-8") as f:
    KB = json.load(f)

# for i, rec in enumerate(KB, 1):
#     print(f"\n--- Registro #{i} ({rec.get('Source_Infotype')})---")
#     print("Preconditions: ", rec.get("Preconditions"))
#     print("resolution_steps: ", rec.get("resolution_steps"))
#     print("Fallbacks: ", rec.get("Fallbacks"))

# Índice
by_key = {r["Source_Infotype"]: r for r in KB}
 
def find_recipe(label: str):
    # 1) Match exacto
    if label in by_key:
        return by_key[label], "exact"
    # 2) Fuzzy por source_key
    candidates = get_close_matches(label, by_key.keys(), n=1, cutoff=0.6)
    if candidates:
        return by_key[candidates[0]], "fuzzy_key"
    # 3) Fuzzy por título si todo falla
    titles = {r["title"]: r for r in KB if r.get("title")}
    cand_titles = get_close_matches(label, titles.keys(), n=1, cutoff=0.6)
    if cand_titles:
        return titles[cand_titles[0]], "fuzzy_title"
    return None, "none"
 
if __name__ == "__main__":
    label = sys.argv[1] if len(sys.argv) > 1 else "0000"
    rec, how = find_recipe(label)
    if not rec:
        print(f"[X] No encontré receta para: {label}")
        sys.exit(1)
    print(f"[{how}] {rec['Source_Infotype']} - {rec.get('title','(sin título)')}")
    print("\nPrecondiciones:")
    for p in rec.get("Preconditions", []): print(f"- {p}")
    print("\nPasos:")
    for i, s in enumerate(rec.get("resolution_steps", []), 1): print(f"{i}. {s}")
    print("\nFallbacks:")
    for f in rec.get("Fallbacks", []): print(f"- {f}")
 