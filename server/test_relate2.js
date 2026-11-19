const { Database } = require('@relate/relate');
const db = new Database('./server/data/welcome-kit.rl');

db.cypher('CREATE (n:Test {name: "hello"})')
  .then((result) => {
    console.log('Create result:', JSON.stringify(result).substring(0, 200));
    return db.cypher('MATCH (n:Test) RETURN n.name');
  })
  .then((result) => {
    console.log('Query result:', JSON.stringify(result).substring(0, 200));
  })
  .catch((err) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  });