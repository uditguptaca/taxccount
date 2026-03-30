const { seedDatabase } = require('./src/lib/seed.js') || require('./src/lib/seed.ts') || {};

async function test() {
  try {
     seedDatabase();
     console.log('Seed success');
  } catch(e) {
     console.error('Seed Failed', e);
  }
}
test();
