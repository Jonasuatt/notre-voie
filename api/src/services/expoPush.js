// Envoi de notifications push via l'API Expo Push (app mobile grand public).
// Aucune dépendance externe : Node ≥ 18 fournit `fetch` nativement.
// Doc : https://docs.expo.dev/push-notifications/sending-notifications/

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const TAILLE_LOT = 100; // limite recommandée par lot par l'API Expo

function isExpoPushToken(token) {
  return typeof token === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(token);
}

function chunk(arr, size) {
  const lots = [];
  for (let i = 0; i < arr.length; i += size) lots.push(arr.slice(i, i + size));
  return lots;
}

/**
 * Envoie une notification push à une liste de tokens Expo.
 * @param {string[]} tokens
 * @param {{ title: string, body?: string, data?: object }} message
 * @returns {Promise<{ envoyes: number, echecs: number, tokensInvalides: number }>}
 */
async function sendExpoPush(tokens, message) {
  const tokensUniques = [...new Set(tokens)];
  const tokensValides = tokensUniques.filter(isExpoPushToken);
  const tokensInvalides = tokensUniques.length - tokensValides.length;

  if (tokensValides.length === 0) {
    return { envoyes: 0, echecs: 0, tokensInvalides };
  }

  let envoyes = 0;
  let echecs = 0;

  for (const lot of chunk(tokensValides, TAILLE_LOT)) {
    const messages = lot.map((to) => ({
      to,
      sound: 'default',
      title: message.title,
      body: message.body || '',
      data: message.data || {},
    }));

    try {
      const reponse = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(messages),
      });
      const json = await reponse.json();
      const tickets = Array.isArray(json.data) ? json.data : [];
      for (const ticket of tickets) {
        if (ticket.status === 'ok') envoyes += 1;
        else echecs += 1;
      }
      // Si l'API n'a pas répondu un ticket par message envoyé (erreur globale du lot)
      if (tickets.length !== lot.length) {
        echecs += lot.length - tickets.length;
      }
    } catch (e) {
      console.error('Erreur envoi Expo Push (lot ignoré) :', e.message);
      echecs += lot.length;
    }
  }

  return { envoyes, echecs, tokensInvalides };
}

module.exports = { sendExpoPush, isExpoPushToken };
