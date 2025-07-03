// Create file: backend/generate-hashes.js
const bcrypt = require('bcrypt');

async function generateHashes() {
  console.log('🔐 Generating bcrypt hashes for your passwords...\n');
  
  const passwords = [
    'admin123',
    'croatia123', 
    'test123'
  ];

  for (const password of passwords) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: "${password}"`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
  
  console.log('✅ Copy these hashes into your Supabase database!');
}

generateHashes();