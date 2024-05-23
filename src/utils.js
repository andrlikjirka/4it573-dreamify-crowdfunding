export const translateDreamStatus = (dreamStatus) => {
    switch (dreamStatus) {
        case 'waiting':
            return 'Čeká na schválení';
        case 'approved':
            return 'Schválený';
        case 'cancelled':
            return 'Zamítnutý';
        case 'successful':
            return 'Úspěšný';
        case 'failed':
            return 'Neúspěšný';
        default:
            return 'neznámá';
    }
};

export const categories = new Map([
  ['business', 'Podnikání'],
  ['travelling', 'Cestování'],
  ['school', 'Vzdělávání'],
  ['nature', 'Příroda a ekologie'],
  ['art', 'Umění'],
  ['music', 'Hudba'],
  ['movies', 'Film'],
  ['sport', 'Sport'],
  ['other', 'Ostatní'],
]);
