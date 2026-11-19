const { Database } = require('@relate/relate');
const db = new Database('./server/data/welcome-kit.rl');

db.connect()
  .then(() => {
    console.log('Connected!');
    // Check available methods
    console.log('Methods:', Object.getOwnPropertyNames(db).filter(k => typeof db[k] === 'function'));
  })
  .catch(e => {
    console.error('Connect error:', e.message);
  });