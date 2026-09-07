const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Le Cerveau numérique — mémoire du journal.
//
// Doctrine : le Cerveau répond d'abord tout seul. La recherche plein texte de
// PostgreSQL et le rapprochement lexical traitent l'essentiel des besoins de
// la rédaction sans appeler de service payant : sur un fonds de plusieurs
// milliers d'articles, retrouver « orpaillage à Bouaflé » ou les papiers déjà
// écrits sur un sujet ne demande pas un modèle de langage. Une assistance par
// IA ne se justifie que pour ce que ces requêtes ne savent pas faire —
// résumer, reformuler — et devra rester un appel explicite, jamais un réflexe
// déclenché à chaque frappe.
//
// Le texte cherché est nettoyé de ses balises à la volée : le corps est stocké
// en HTML, et sans cela une recherche sur « p » remonterait tout le fonds.
// Les tags sont absents de cette expression à dessein : array_to_string n'est
// pas immutable, et PostgreSQL refuse alors d'indexer l'expression. Ils sont
// de toute façon presque toujours des mots déjà présents dans le texte, et
// le rapprochement d'articles, lui, continue de s'appuyer dessus.
const CHAMP_TEXTE = `
  setweight(to_tsvector('french', coalesce(a.titre, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(a.chapo, '')), 'B') ||
  setweight(to_tsvector('french', regexp_replace(coalesce(a."contenuHtml", ''), '<[^>]+>', ' ', 'g')), 'C')
`;

// GET /api/cerveau/recherche?q=…&rubrique=…&depuis=…&jusqua=…&page=…
//
// Le classement suit la pondération ci-dessus : un mot dans le titre pèse plus
// que le même mot au milieu du corps.
const recherche = asyncHandler(async (req, res) => {
  const { q, rubrique, depuis, jusqua, page = 1, pageSize = 20 } = req.query;
  if (!q || String(q).trim().length < 2) {
    return res.status(422).json({ error: 'Indiquez au moins deux caractères à chercher.' });
  }
  const taille = Math.min(Number(pageSize) || 20, 50);
  const saut = (Math.max(Number(page) || 1, 1) - 1) * taille;

  // websearch_to_tsquery accepte la syntaxe qu'un journaliste écrit
  // spontanément : "guillemets" pour une expression exacte, OR, et le signe
  // moins pour exclure.
  const conditions = [`(${CHAMP_TEXTE}) @@ websearch_to_tsquery('french', $1)`];
  const params = [String(q).trim()];

  if (rubrique) {
    params.push(rubrique);
    conditions.push(`r.slug = $${params.length}`);
  }
  if (depuis) {
    params.push(new Date(depuis));
    conditions.push(`a."publieLe" >= $${params.length}`);
  }
  if (jusqua) {
    params.push(new Date(jusqua));
    conditions.push(`a."publieLe" <= $${params.length}`);
  }

  const where = conditions.join(' AND ');
  const [lignes, total] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT a.id, a.slug, a.titre, a.chapo, a."publieLe", a.format, a.statut, a.tags,
              r.nom AS "rubriqueNom", r.slug AS "rubriqueSlug", r.couleur AS "rubriqueCouleur",
              ts_rank(${CHAMP_TEXTE}, websearch_to_tsquery('french', $1)) AS score,
              ts_headline('french',
                regexp_replace(coalesce(a."contenuHtml", a.chapo, ''), '<[^>]+>', ' ', 'g'),
                websearch_to_tsquery('french', $1),
                'StartSel=<mark>, StopSel=</mark>, MaxWords=28, MinWords=12, MaxFragments=1'
              ) AS extrait
         FROM articles a
         JOIN rubriques r ON r.id = a."rubriqueId"
        WHERE ${where}
        ORDER BY score DESC, a."publieLe" DESC
        LIMIT ${taille} OFFSET ${saut}`,
      ...params,
    ),
    prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS total FROM articles a JOIN rubriques r ON r.id = a."rubriqueId" WHERE ${where}`,
      ...params,
    ),
  ]);

  res.json({ resultats: lignes, total: total[0]?.total || 0, page: Number(page), pageSize: taille });
});

// GET /api/cerveau/similaires/:id — les papiers déjà écrits sur le même sujet.
//
// Le rapprochement part du titre, du chapô et des tags de l'article : ce sont
// eux qui portent le sujet. Un même mot-clé au milieu d'un corps de 3 000
// signes ne suffit pas à faire deux articles « du même sujet ».
const similaires = asyncHandler(async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    select: { id: true, titre: true, chapo: true, tags: true, rubriqueId: true },
  });
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });

  // Les tags de tri interne ne disent rien du sujet et fausseraient tout
  // rapprochement s'ils entraient dans la requête.
  const TAGS_TECHNIQUES = ['archives-papier', 'apercu-interne', 'casse-relue'];
  const motsTags = (article.tags || []).filter((t) => !TAGS_TECHNIQUES.includes(t) && !/^numero-\d+$/.test(t));
  const graine = [article.titre, article.chapo, ...motsTags].filter(Boolean).join(' ');

  const resultats = await prisma.$queryRawUnsafe(
    `SELECT a.id, a.slug, a.titre, a."publieLe", a.format,
            r.nom AS "rubriqueNom", r.slug AS "rubriqueSlug", r.couleur AS "rubriqueCouleur",
            ts_rank(
              setweight(to_tsvector('french', coalesce(a.titre, '')), 'A') ||
              setweight(to_tsvector('french', coalesce(a.chapo, '')), 'B') ||
              setweight(to_tsvector('french', coalesce(array_to_string(a.tags, ' '), '')), 'B'),
              plainto_tsquery('french', $1)
            ) AS score
       FROM articles a
       JOIN rubriques r ON r.id = a."rubriqueId"
      WHERE a.id <> $2
        AND (
          setweight(to_tsvector('french', coalesce(a.titre, '')), 'A') ||
          setweight(to_tsvector('french', coalesce(a.chapo, '')), 'B') ||
          setweight(to_tsvector('french', coalesce(array_to_string(a.tags, ' '), '')), 'B')
        ) @@ plainto_tsquery('french', $1)
      ORDER BY score DESC, a."publieLe" DESC
      LIMIT 8`,
    graine,
    article.id,
  );

  res.json({ article: { id: article.id, titre: article.titre }, similaires: resultats });
});

// GET /api/cerveau/apercu — ce que le Cerveau a en mémoire.
const apercu = asyncHandler(async (req, res) => {
  const [articles, editions, rubriques, medias, plage, parRubrique] = await Promise.all([
    prisma.article.count(),
    prisma.edition.count(),
    prisma.rubrique.count(),
    prisma.media.count(),
    prisma.$queryRawUnsafe(
      `SELECT min("publieLe") AS debut, max("publieLe") AS fin FROM articles WHERE "publieLe" IS NOT NULL`,
    ),
    prisma.$queryRawUnsafe(
      `SELECT r.nom, r.slug, r.couleur, count(a.id)::int AS total
         FROM rubriques r LEFT JOIN articles a ON a."rubriqueId" = r.id
        GROUP BY r.id ORDER BY total DESC LIMIT 12`,
    ),
  ]);

  res.json({
    articles,
    editions,
    rubriques,
    medias,
    couverture: plage[0] || null,
    parRubrique,
  });
});

module.exports = { recherche, similaires, apercu };
