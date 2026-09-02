// Runtime entrypoint: the compiled API runs on plain `node`, which cannot load
// the TypeScript `index.ts` used for types. Both files re-export @prisma/client.
module.exports = require('@prisma/client');
