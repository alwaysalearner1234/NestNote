const { Database } = require('@relate/relate');
const db = new Database('./server/data/welcome-kit.rl');

console.log('Database keys:');
for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(db))) {
  console.log(' -', key);
}
console.log('Own keys:');
for (const key of Object.keys(db)) {
  console.log(' -', key, typeof db[key]);
}