require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// L'API tourne derrière le proxy Railway, qui ajoute X-Forwarded-For —
// sans ce réglage, express-rate-limit ne peut pas identifier les clients
// de façon fiable (et lève une erreur à chaque requête en production).
app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const allowAllOrigins = allowedOrigins.includes('*');
app.use(
  cors({
    // Le paquet `cors` ne traite pas un tableau contenant "*" comme un
    // joker : il faut passer `true` (reflète l'origine de la requête)
    // explicitement pour autoriser tout le monde.
    origin: allowAllOrigins || allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true,
  })
);

// Limite générale ; les routes de connexion ont en plus leur propre
// throttle plus strict pour freiner le bruteforce (voir authLimiter).
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth/staff/login', authLimiter);
app.use('/api/auth/reader/login', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'notre-voie-api', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/rubriques', require('./routes/rubriques.routes'));
app.use('/api/articles', require('./routes/articles.routes'));
app.use('/api/editions', require('./routes/editions.routes'));
app.use('/api/prix-vie-chere', require('./routes/prixVieChere.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/abonnements', require('./routes/abonnements.routes'));
app.use('/api/paiements', require('./routes/paiements.routes'));
app.use('/api/campagnes', require('./routes/campagnes.routes'));
app.use('/api/verite-ou-intox', require('./routes/factCheck.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Notre Voie API à l'écoute sur le port ${PORT}`));
  require('./jobs/pushNotifications.job').demarrerJobNotifications();
}

module.exports = app;
