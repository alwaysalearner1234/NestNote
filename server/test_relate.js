const r = require('@relate/relate');
const Relate = r.Relate;
const relate = new Relate('./server/data/welcome-kit.rl');

relate.cypher('CREATE (n:Test {name: "hello"})').then((result) => {
  console.log('Cypher result:', result);
  return relate.cypher('MATCH (n:Test) RETURN n.name');
}).then((result) => {
  console.log('Query result:', result);
}).catch((err) => {
  console.error('Error:', err.message);
});