# -*- coding: utf-8 -*-
"""Lit l'ours de la Une de chaque PDF pour en tirer numero + date(s) de parution.

L'ours suit toujours la forme "N°7730 DU MERCREDI 27 AOUT 2025 - Prix 300 FCFA",
avec des variantes de composition (mots collés, "DU DU", numéro à cheval sur un
week-end avec changement de mois). On normalise avant de lire.
"""
import re, json, glob, os, unicodedata
import fitz

DOSSIER = r"C:\Users\User\Documents\Claude\Notre Voie Document\Unes Notre Voie"
MOIS = {'JANVIER':1,'FEVRIER':2,'MARS':3,'AVRIL':4,'MAI':5,'JUIN':6,'JUILLET':7,
        'AOUT':8,'SEPTEMBRE':9,'OCTOBRE':10,'NOVEMBRE':11,'DECEMBRE':12}
JOURS = 'LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI|DIMANCHE'
M = '|'.join(MOIS)

# Corrections manuelles : coquilles d'ours impossibles à lire mécaniquement.
# 7913 : "DU VENDREDI 22 AU LUNDI MAI 2026" — quantième de fin manquant.
MANUEL = {7913: ("2026-05-22", "2026-05-25")}

RE = re.compile(
    rf"N\s*°\s*(\d{{4}})\s+(?:DU\s+)+(?:(?:{JOURS})\s+)?(\d{{1,2}})(?:\s*ER)?"
    rf"(?:\s+({M}))?"
    rf"(?:\s+AU\s+(?:(?:{JOURS})\s+)?(\d{{1,2}})(?:\s*ER)?(?:\s+({M}))?)?"
    rf"(?:\s+({M}))?\s+(\d{{4}})")

def normaliser(txt):
    t = ''.join(c for c in unicodedata.normalize('NFD', txt) if unicodedata.category(c) != 'Mn')
    t = t.upper().replace('\n', ' ')
    t = re.sub(rf"(?<=[A-Z0-9])(?={JOURS}|{M})", ' ', t)   # "DUMERCREDI", "22JUIN"
    return re.sub(r'\s+', ' ', t)

def lire(chemin):
    with fitz.open(chemin) as d:
        t = normaliser(d[0].get_text())
    m = RE.search(t)
    if not m:
        return None
    num, j1, m1, j2, m2, m3, an = m.groups()
    fin = m2 or m3 or m1
    deb = m1 or fin
    if not deb or not fin:
        return None
    num = int(num)
    d1 = f"{an}-{MOIS[deb]:02d}-{int(j1):02d}"
    d2 = f"{an}-{MOIS[fin]:02d}-{int(j2):02d}" if j2 else None
    # L'ours ne millesime que la fin ("DU MERCREDI 31 DECEMBRE AU DIMANCHE
    # 4 JANVIER 2026") : un numero a cheval sur le nouvel an commence donc
    # l'annee precedente.
    if d2 and d2 <= d1:
        d1 = f"{int(an) - 1}-{MOIS[deb]:02d}-{int(j1):02d}"
    if num in MANUEL:
        d1, d2 = MANUEL[num]
    return {"numero": num, "dateParution": d1, "dateFin": d2,
            "fichier": os.path.basename(chemin)}

if __name__ == '__main__':
    ok, ko = [], []
    for f in sorted(glob.glob(os.path.join(DOSSIER, '*.pdf'))):
        r = lire(f)
        (ok if r else ko).append(r or os.path.basename(f))
    # Un numero manquant dans MANUEL ne sort pas du parseur : on le rattrape ici.
    for num, (d1, d2) in MANUEL.items():
        if not any(o['numero'] == num for o in ok):
            f = next((k for k in ko if str(num) in k), None)
            if f:
                ko.remove(f)
                ok.append({"numero": num, "dateParution": d1, "dateFin": d2, "fichier": f})
    ok.sort(key=lambda o: o['numero'])
    print(f"{len(ok)} lus / {len(ko)} echecs")
    for k in ko: print('  KO', k)
    doublons = [o['numero'] for o in ok if [x['numero'] for x in ok].count(o['numero']) > 1]
    print('doublons de numero:', sorted(set(doublons)) or 'aucun')
    print('plage:', ok[0]['numero'], '->', ok[-1]['numero'], '|', ok[0]['dateParution'], '->', ok[-1]['dateParution'])
    json.dump(ok, open(os.path.join(os.path.dirname(__file__), 'unes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
