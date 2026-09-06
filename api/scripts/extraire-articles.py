# -*- coding: utf-8 -*-
"""Extrait les articles de chaque numero archive (245 PDF) vers un manifeste.

La maquette du journal se lit dans les tailles de composition : titres au-dela
de 18 pt, chapo entre 11 et 18, corps en dessous, ours sous 7,5. Trois pieges
propres a une mise en page de presse sont traites explicitement :
  - deux articles cote a cote, dont un simple tri vertical melangeait les corps
    (rattachement par bande de colonnes, cf. `chevauche`) ;
  - la lettrine composee dans un bloc a part, qui amputait le premier mot ;
  - l'ours et les mentions legales en pied de page.

Sortie : scripts/articles-unes.json.gz (manifeste lu par le seed).
"""
import gzip, json, glob, os, re, sys, unicodedata
import fitz

DOSSIER = r"C:\Users\User\Documents\Claude\Notre Voie Document\Unes Notre Voie"
SORTIE = os.path.join(os.path.dirname(__file__), 'articles-unes.json.gz')

# En-tete de page -> rubrique du site. Ce que le journal imprime en tete de
# page est un bien meilleur indicateur que la position de la page.
RUBRIQUES = [
    ('politique', 'politique'), ('economie', 'economie'), ('societe', 'societe'),
    ('culture', 'culture'), ('region', 'regions'), ('sport', 'sport'),
    ('mondial', 'sport'), ('can ', 'sport'),
]
GABARIT = {2: 'politique', 3: 'politique', 4: 'economie', 5: 'culture',
           6: 'societe', 7: 'regions', 8: 'sport'}

def sansaccent(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

# Le PDF glisse des octets de controle (dont 0x00) que Postgres refuse.
CTRL = re.compile('[%s]' % ''.join(chr(c) for c in list(range(0, 9)) + [11, 12] + list(range(14, 32)) + [127]))

def recoller(t):
    t = CTRL.sub('', t)
    t = re.sub(r'(\w)-\s+(\w)', r'\1\2', t)
    t = t.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('ﬀ', 'ff')
    return re.sub(r'\s+', ' ', t).strip()

def blocs(page):
    """Blocs de composition homogenes.

    Un meme bloc PDF melange souvent le surtitre (Zeitung, petite capitale) et
    le titre (LibelSuit) : on le redecoupe donc par famille de police, ligne a
    ligne, sinon les deux restent colles dans le titre.
    """
    out = []
    for b in page.get_text('dict')['blocks']:
        if 'lines' not in b:
            continue
        courant = None
        for ligne in b['lines']:
            spans = [s for s in ligne['spans'] if s['text'].strip()]
            if not spans:
                continue
            dominante = max(spans, key=lambda s: len(s['text']))
            famille = 'Zeitung' if 'Zeitung' in dominante['font'] else 'autre'
            taille = max(s['size'] for s in spans)
            txt = ' '.join(s['text'] for s in spans).strip()
            x0, y0, x1, y1 = ligne['bbox']
            if courant and courant['famille'] == famille and abs(courant['sz'] - taille) < 2.5:
                courant['txt'] += ' ' + txt
                courant['x'] = min(courant['x'], x0); courant['y'] = min(courant['y'], y0)
                courant['x1'] = max(courant['x1'], x1); courant['y1'] = max(courant['y1'], y1)
            else:
                courant = {'txt': txt, 'sz': taille, 'police': dominante['font'],
                           'famille': famille, 'x': x0, 'y': y0, 'x1': x1, 'y1': y1}
                out.append(courant)
    return out


# Le journal compose ses surtitres en Zeitung, une petite capitale dont
# l'encodage restitue une casse desordonnee ("ANNExE fIScALE"), et ses titres
# en LibelSuit, de casse fiable. La police separe donc les deux bien mieux que
# la taille ; le surtitre est rendu en capitales, comme a l'impression.
def est_surtitre(b):
    return b['famille'] == 'Zeitung'

def capitales(t):
    return t.upper() if t else t

def chevauche(a, b):
    return min(a['x1'], b['x1']) - max(a['x'], b['x']) > 20

SIGNATURE = re.compile(
    r"^(Par\s+[A-ZÀ-Ý][\w'’.-]+(\s+[A-ZÀ-Ý][\w'’.-]+){0,3}"      # "Par Edouard Yro Gozz"
    r"|[A-Z]{2,5}"                                                    # sigle d'agence : AIP, APA
    r"|[A-ZÀ-Ý][\w'’.-]+(\s+[A-ZÀ-Ý][\w'’.-]+){1,3})$")            # "Doumbia Namory"

def est_signature(t):
    t = t.strip().rstrip('.')
    return len(t) <= 60 and bool(SIGNATURE.match(t))

def rubrique_de_page(bs, numero_page):
    for b in sorted([b for b in bs if b['y'] < 80 and b['sz'] >= 16], key=lambda b: b['y']):
        t = sansaccent(b['txt']).lower()
        for motif, slug in RUBRIQUES:
            if motif in t:
                return slug
    return GABARIT.get(numero_page)

def articles_de_page(page, numero_page):
    tous = blocs(page)
    rubrique = rubrique_de_page(tous, numero_page)
    bs = [b for b in tous if b['y'] > 80 and b['sz'] >= 7.5]
    titres = sorted([b for b in bs if b['sz'] >= 18 and len(b['txt']) > 12 and not est_surtitre(b)],
                    key=lambda b: b['y'])
    if not titres:
        return []
    reste = [b for b in bs if b not in titres]

    paquets = {i: [] for i in range(len(titres))}
    for b in reste:
        cands = [i for i, t in enumerate(titres) if t['y'] <= b['y'] + 45 and chevauche(t, b)]
        if cands:
            paquets[max(cands, key=lambda i: titres[i]['y'])].append(b)

    arts = []
    for i, t in enumerate(titres):
        gr = paquets[i]
        sur = [b for b in gr if b['y'] < t['y'] and b['sz'] >= 12 and est_surtitre(b)]
        sous = [b for b in gr if b['y'] >= t['y']]
        chapo = [b for b in sous if 11 <= b['sz'] < 18 and not est_surtitre(b)]
        txt = sorted([b for b in sous if b['sz'] < 11], key=lambda b: (round(b['x'] / 100), b['y']))
        # La signature se lit avant tout recollage : sinon la lettrine vient
        # s'y coller ("larthur Zébé") et la rend meconnaissable. Seuls les
        # motifs surs sont retenus — mieux vaut pas de signature qu'une
        # legende de photo affichee comme auteur.
        signature = ''
        if txt and len(txt) > 1 and est_signature(recoller(txt[0]['txt'])):
            signature, txt = recoller(txt[0]['txt']), txt[1:]

        # La lettrine, composee dans un bloc a part, se recolle au fragment
        # qu'elle jouxte : la suite du mot commence par une minuscule.
        for lt in [b for b in sous if len(b['txt']) <= 2 and b['sz'] >= 20]:
            voisins = [b for b in txt if b['y'] < lt['y1'] + 10 and b['y1'] > lt['y'] - 10]
            cibles = [b for b in voisins if b['txt'][:1].islower()] or voisins
            if cibles:
                cible = min(cibles, key=lambda b: abs(b['x'] - lt['x1']) + abs(b['y'] - lt['y']))
                cible['txt'] = lt['txt'] + cible['txt']
        corps = recoller(' '.join(b['txt'] for b in txt))
        corps = corps[:1].upper() + corps[1:]

        arts.append({
            'page': numero_page,
            'rubrique': rubrique,
            'surtitre': capitales(recoller(' '.join(b['txt'] for b in sorted(sur, key=lambda b: b['y'])))),
            'titre': recoller(t['txt']),
            'chapo': recoller(' '.join(b['txt'] for b in chapo)),
            'signature': signature,
            'corps': recoller(' '.join(b['txt'] for b in txt)),
        })

    # Un "titre" sans corps est le surtitre de l'article suivant ("mon point
    # de vue" au-dessus d'une tribune) : on le lui rend.
    orphelin, gardes = None, []
    for a in arts:
        if len(a['corps']) < 200:
            orphelin = a['titre']
            continue
        if orphelin and not a['surtitre']:
            a['surtitre'] = orphelin
        orphelin = None
        gardes.append(a)
    return gardes

def main():
    unes = {u['numero']: u for u in json.load(open(os.path.join(os.path.dirname(__file__), 'unes.json'), encoding='utf-8'))}
    sortie, sans_rubrique = [], 0
    for numero in sorted(unes):
        chemin = os.path.join(DOSSIER, unes[numero]['fichier'])
        try:
            doc = fitz.open(chemin)
        except Exception as e:
            print('  illisible', numero, e); continue
        for i in range(1, doc.page_count):          # page 1 = la Une, pas d'article suivi
            for a in articles_de_page(doc[i], i + 1):
                if not a['rubrique']:
                    sans_rubrique += 1
                    continue
                a['numero'] = numero
                a['date'] = unes[numero]['dateParution']
                sortie.append(a)
        doc.close()
        if numero % 20 == 0:
            print(f'  {numero} — {len(sortie)} articles')
    with gzip.open(SORTIE, 'wt', encoding='utf-8') as f:
        json.dump(sortie, f, ensure_ascii=False)
    print(f'{len(sortie)} articles extraits ({sans_rubrique} ecartes faute de rubrique) -> {SORTIE}')

if __name__ == '__main__':
    main()
