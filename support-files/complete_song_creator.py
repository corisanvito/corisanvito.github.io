import os
import json
import re

# --- Funzioni di base per creare HTML del canto ---
def create_song_html(title, song_text, link=None, n1=None, n2=None):
    sections = song_text.split('\n\n')

    html_content = []
    chorus_text = None
    
    for section in sections:
        if section.strip() == "Rit.":
            if chorus_text:
                html_content.append(
                    '\t\t\t<p class="chorus">\n' +
                    '\n'.join(f'\t\t\t\t{line}<br>' for line in chorus_text.split('\n')) +
                    '\n\t\t\t</p>'
                )
        elif section.startswith('Rit.: '):
            lines_all = section.split('\n')
            chorus_first_line = lines_all[0][6:].strip()
            chorus_lines = [chorus_first_line]
            verse_start_idx = 1
            for idx in range(1, len(lines_all)):
                line = lines_all[idx]
                if line == "" or line.endswith(" Rit.") or not line.strip():
                    verse_start_idx = idx
                    break
                chorus_lines.append(line)
                verse_start_idx = idx + 1
            chorus_text = '\n'.join(chorus_lines)
            html_content.append(
                '\t\t\t<p class="chorus">\n' +
                '\n'.join(f'\t\t\t\t{line}<br>' for line in chorus_lines) +
                '\n\t\t\t</p>'
            )
            remaining_lines = lines_all[verse_start_idx:]
            if remaining_lines:
                pending_lines = []
                for line in remaining_lines:
                    if line.endswith(" Rit."):
                        pending_lines.append(line[:-5].rstrip())
                        html_content.append(
                            '\t\t\t<p class="verse">\n' +
                            '\n'.join(f'\t\t\t\t{l}<br>' for l in pending_lines) +
                            '\n\t\t\t</p>'
                        )
                        if chorus_text:
                            html_content.append(
                                '\t\t\t<p class="chorus">\n' +
                                '\n'.join(f'\t\t\t\t{l}<br>' for l in chorus_text.split('\n')) +
                                '\n\t\t\t</p>'
                            )
                        pending_lines = []
                    else:
                        pending_lines.append(line)
                if pending_lines:
                    html_content.append(
                        '\t\t\t<p class="verse">\n' +
                        '\n'.join(f'\t\t\t\t{l}<br>' for l in pending_lines) +
                        '\n\t\t\t</p>'
                    )
        else:
            class_name = "verse"
            content = section
            
            if section.startswith("Intro: "):
                class_name = "intro"
                content = section[7:].strip()
            elif section.startswith("Outro: "):
                class_name = "outro"
                content = section[7:].strip()
            elif section.startswith("Bridge: "):
                class_name = "bridge"
                content = section[8:].strip()

            lines = content.split('\n')
            pending_lines = []
            for line in lines:
                if line.endswith(" Rit."):
                    pending_lines.append(line[:-5].rstrip())
                    html_content.append(
                        f'\t\t\t<p class="{class_name}">\n' +
                        '\n'.join(f'\t\t\t\t{l}<br>' for l in pending_lines) +
                        '\n\t\t\t</p>'
                    )
                    if chorus_text:
                        html_content.append(
                            '\t\t\t<p class="chorus">\n' +
                            '\n'.join(f'\t\t\t\t{l}<br>' for l in chorus_text.split('\n')) +
                            '\n\t\t\t</p>'
                        )
                    pending_lines = []
                else:
                    pending_lines.append(line)
            if pending_lines:
                html_content.append(
                    f'\t\t\t<p class="{class_name}">\n' +
                    '\n'.join(f'\t\t\t\t{l}<br>' for l in pending_lines) +
                    '\n\t\t\t</p>'
                )

    html_body = '\n'.join(html_content)

    extra_sections = ''
    if link:
        extra_sections += f'''
            <section class="video-container">
                <iframe width="560" height="315" src="{link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </section>
        '''
    if n1 or n2:
        extra_sections += '''
            <section>Puoi trovare questo canto al numero:<br>'''
        if n1:
            extra_sections += f'''
            <b>{n1}</b> nel quaderno ad anelli (libretto della Minicorale)<br>\n'''
        if n2:
            extra_sections += f'''
            <b>{n2}</b> nel libro dei canti dell\'assemblea<br>\n'''
        extra_sections += f'''
        </section>'''

    filename = title.lower().replace(" ", "-").replace("'", "-").replace("è", "e").replace("ò", "o").replace("à", "a").replace("(", "").replace(")", "").replace("È", "e").replace("ì", "i").replace(",", "")
    html_template = f'''<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>

    <link rel="icon" href="../images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
    <link rel="apple-touch-icon" href="../images/apple-touch-icon.png">
    <link rel="manifest" href="../images/site.webmanifest">

    <meta name="msapplication-TileColor" content="#1b1b1b">
    <meta name="theme-color" content="#1b1b1b">

    <link rel="stylesheet" href="../style/style.css">
    <link rel="stylesheet" href="../style/canti.css">

    <script src="https://cdn.counter.dev/script.js" data-id="0b8a28a7-bd9e-4970-aa87-bd107e273a32" data-utcoffset="1"></script>
</head>

<body>
    <header>
        <h1><a href="../">Cori San Vito</a></h1>
        <input type="checkbox" id="menu-toggle" class="menu-toggle">
        <label for="menu-toggle" class="menu-icon">
            <span></span>
            <span></span>
            <span></span>
        </label>
        <div class="overlay"></div>
        <nav>
            <ul>
                <li><a href="..">Tutti i cori</a></li>
                <li><a href="../canti">Canti</a></li>
                <li><a href="../portale">Area riservata</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section class="song" data-tags="">
            <h2>{title}</h2>
{html_body}
        </section>

        <aside class="details">
        
            {extra_sections}

            <section>
                <div class="download">
                    <a href="../pdf-testi/{filename}.pdf" target="_blank" class="download-link">
                        <img class="ico" height="32px" width="32px" alt="canto.pdf" title="canto.pdf"
                            src="../images/text-file.png">
                        <span>Scarica il testo in PDF</span>
                    </a>
                </div>
            </section>
        </aside>
    </main>

    <footer>
        <p>&copy; 2025 Cori San Vito - <a class="privacy" href="../privacy">Privacy</a></p>
    </footer>

    <button id="autoScrollBtn" class="auto-scroll-btn">
        <span class="scroll-speed">OFF</span>
        <span class="scroll-icon">▼</span>
    </button>

    <script src="../script/get-zoom.js" defer></script>
    <script src="../script/auto-scroll.js" defer></script>
    <!--<script src="../script/contatore-visite.js"></script>-->
</body>

</html>'''

    script_dir = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.join(script_dir, "..", "canti")
    full_path = os.path.join(save_dir, f"{filename}.html")
    with open(full_path, 'w', encoding='utf-8') as file:
        file.write(html_template)
    print(f"✅ File HTML creato: {full_path}")
    return filename, f"{filename}.html"


def add_song_to_html_list(title, filename):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_file_path = os.path.join(script_dir, "..", "canti.html")
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    first_letter = title[0].upper()
    if not first_letter.isalpha():
        first_letter = 'A'
    
    letter_group_pattern = f'<div class="lettera-gruppo" id="{first_letter}">(.*?)</div>'
    match = re.search(letter_group_pattern, content, re.DOTALL)
    
    if not match:
        print(f"❌ Gruppo lettera '{first_letter}' non trovato in canti.html")
        return False
    
    letter_group = match.group(0)
    
    new_link = f'<a href="canti/{filename}">{title}</a><br>'
    
    canto_link_pattern = r'<div class="canto-link">(.*?)</div>'
    canto_link_match = re.search(canto_link_pattern, letter_group, re.DOTALL)
    
    if not canto_link_match:
        print("❌ Sezione canto-link non trovata")
        return False
    
    old_canto_link_content = canto_link_match.group(1)
    
    links_pattern = r'<a href="(canti/[^"]*)">([^<]*)</a><br>'
    existing_links = re.findall(links_pattern, old_canto_link_content)
    
    existing_links.append((f"canti/{filename}", title))
    existing_links.sort(key=lambda x: x[1].lower())
    
    new_links_content = '\n                        '.join([f'<a href="{href}">{text}</a><br>' for href, text in existing_links])
    
    new_canto_link = f'<div class="canto-link">\n                        {new_links_content}\n                    </div>'
    new_letter_group = letter_group.replace(canto_link_match.group(0), new_canto_link)
    
    new_content = content.replace(letter_group, new_letter_group)
    
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Canto aggiunto a canti.html nel gruppo '{first_letter}'")
    return True


def update_json_ids(data):
    for i, canto in enumerate(data.get("canti", []), start=1):
        canto["id"] = i
    for i, canto in enumerate(data.get("taize", []), start=1):
        canto["id"] = i
    return data


def add_song_to_json(title, filename_html, song_text, categorie=None, metadata=None):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "..", "canti.json")

    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Metadata con chiavi di default sempre presenti
    meta_default = {"Testo": "", "Musica": "", "Album": ""}
    if metadata:
        meta_default.update(metadata)

    new_canto = {
        "titolo": title,
        "id": len(data["canti"]) + 1,
        "testo": song_text,
        "categorie": categorie or [],
        "url": f"canti/{filename_html.replace('.html', '')}",
        "fileName": filename_html,
        "metadata": meta_default
    }

    inserted = False
    for i, canto in enumerate(data["canti"]):
        if title.lower() < canto["titolo"].lower():
            data["canti"].insert(i, new_canto)
            inserted = True
            break
    if not inserted:
        data["canti"].append(new_canto)

    data = update_json_ids(data)

    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Canto aggiunto a canti.json")


def chiedi_metadata():
    print("\n--- Metadati (premi Invio per lasciare vuoto) ---")
    metadata = {}

    campi = [
        ("Testo", "Testo"),
        ("Musica", "Musica"),
        ("Album", "Album"),
        ("Pubblicazione", "Pubblicazione"),
        ("Tempo", "Tempo"),
        ("Categoria/e", "Categoria/e")
    ]

    for chiave, etichetta in campi:
        valore = input(f"{etichetta}: ").strip()
        metadata[chiave] = valore  # aggiunge sempre la chiave, anche se vuota

    while True:
        extra_key = input("Altro campo metadato (nome, o Invio per finire): ").strip()
        if not extra_key:
            break
        extra_val = input(f"Valore per '{extra_key}': ").strip()
        metadata[extra_key] = extra_val

    return metadata


def chiedi_categorie():
    print("\n--- Categorie (premi Invio per finire) ---")
    print("Esempi: ingresso, offertorio, comunione, congedo, natale, pasqua, avvento…")
    categorie = []
    while True:
        cat = input("Categoria: ").strip().lower()
        if not cat:
            break
        categorie.append(cat)
    return categorie


def main():
    title = input("Inserisci il titolo della canzone: ").strip()
    print("Inserisci il testo della canzone (termina con riga vuota + Ctrl+D / Ctrl+Z):")
    song_lines = []
    try:
        while True:
            line = input()
            song_lines.append(line)
    except EOFError:
        pass
    song_text = '\n'.join(song_lines)

    link = input("Link YouTube (opzionale): ").strip()
    if link:
        link = link.replace("https://youtu.be/", "https://www.youtube-nocookie.com/embed/")

    n1 = input("Numero Minicorale (opzionale): ").strip() or None
    n2 = input("Numero libro assemblea (opzionale): ").strip() or None

    categorie = chiedi_categorie()
    metadata = chiedi_metadata()

    filename, filename_html = create_song_html(title, song_text, link, n1, n2)
    add_song_to_json(title, filename_html, song_text, categorie, metadata)


if __name__ == "__main__":
    main()