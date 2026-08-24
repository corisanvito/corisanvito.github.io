"""
normalizza_metadata.py

Aggiunge il campo "metadata" con le sottosezioni "Testo", "Musica", "Album"
a tutti i canti in canti.json, sia nella sezione "canti" che in "taize".
Le chiavi già presenti non vengono sovrascritte.

Uso:
    python normalizza_metadata.py
"""

import os
import json

CHIAVI_DEFAULT = ["Testo", "Musica", "Album"]

def normalizza():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "..", "canti.json")

    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    aggiornati = 0

    for sezione in ("canti", "taize"):
        for canto in data.get(sezione, []):
            if "metadata" not in canto:
                canto["metadata"] = {}
            modificato = False
            for chiave in CHIAVI_DEFAULT:
                if chiave not in canto["metadata"]:
                    canto["metadata"][chiave] = ""
                    modificato = True
            if modificato:
                aggiornati += 1

    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ Normalizzazione completata.")
    print(f"   Canti aggiornati: {aggiornati}")

if __name__ == "__main__":
    normalizza()