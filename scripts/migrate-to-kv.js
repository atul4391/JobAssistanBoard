#!/usr/bin/env node
/**
 * Migration script to transfer data from local JSON file to Vercel KV
 * Usage: node scripts/migrate-to-kv.js
 * 
 * Requires VERCEL_KV_URL and VERCEL_KV_TOKEN environment variables
 */

import { createClient } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Vercel KV client
const kv = createClient({
  url: process.env.VERCEL_KV_URL,
  token: process.env.VERCEL_KV_TOKEN,
});

async function migrate() {
  try {
    // Read local JSON database
    const dbPath = path.join(__dirname, '..', 'server', 'db.json');
    
    if (!fs.existsSync(dbPath)) {
      console.log('No local db.json found. Starting with empty database.');
      await kv.set('jobs', []);
      await kv.set('nextId', 1);
      console.log('✅ Initialized empty database in Vercel KV');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    console.log(`Found ${data.jobs?.length || 0} jobs in local database`);
    
    // Migrate to Vercel KV
    await kv.set('jobs', data.jobs || []);
    await kv.set('nextId', data.nextId || 1);
    
    // Verify migration
    const migratedJobs = await kv.get('jobs');
    const migratedNextId = await kv.get('nextId');
    
    console.log('\n✅ Migration successful!');
    console.log(`   Jobs migrated: ${migratedJobs.length}`);
    console.log(`   Next ID: ${migratedNextId}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nMake sure you have set:');
    console.error('  - VERCEL_KV_URL');
    console.error('  - VERCEL_KV_TOKEN');
    process.exit(1);
  }
}

migrate();
