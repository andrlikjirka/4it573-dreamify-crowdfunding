import sanitizeHtml from "sanitize-html";

export const userRoles = new Map([
   ['admin', 'Administrátor'],
   ['user', 'Uživatel']
]);

export const dreamStatus = new Map([
    ['waiting', 'Čeká na schválení'],
    ['approved', 'Schválený'],
    ['cancelled', 'Zamítnutý'],
    ['successful', 'Úspěšný'],
    ['failed', 'Neúspěšný'],
]);

export const categories = new Map([
  ['business', 'Podnikání'],
  ['travelling', 'Cestování'],
  ['school', 'Vzdělávání'],
  ['nature', 'Příroda a ekologie'],
  ['art', 'Umění'],
  ['music', 'Hudba'],
  ['movies', 'Film'],
  ['sport', 'Sport'],
  ['entertainment', 'Zábava'],
  ['other', 'Ostatní'],
]);

export const tinyMceOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading' ],
        '*': ['style'],
    },
}

export const PORT = process.env.NODE_ENV === 'test' ? process.env.TEST_APP_PORT : process.env.APP_PORT