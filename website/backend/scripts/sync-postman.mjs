import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DEFAULT_UID = '59177886-869e0ccc-64e7-47df-b673-4c83772dd1d8';
const apiKey = process.argv[2] || process.env.POSTMAN_API_KEY;
const collectionUid = process.env.POSTMAN_COLLECTION_UID || DEFAULT_UID;

async function syncPostman() {
  console.log('----------------------------------------------------');
  console.log(' NISPL Cloud Tech - Postman Automated Sync');
  console.log(' Target Collection UID:', collectionUid);
  console.log('----------------------------------------------------');

  if (!apiKey) {
    console.error('\n❌ ERROR: POSTMAN_API_KEY is not defined.');
    console.error('\nTo fix this:');
    console.error('1. In Postman: Go to Workspace -> Settings -> API Keys (or https://web.postman.co/settings/me/api-keys) and Generate an API Key.');
    console.error('2. For GitHub Actions: Add it to GitHub Repo Secrets:');
    console.error('   Repository -> Settings -> Secrets and variables -> Actions -> New repository secret:');
    console.error('   Name: POSTMAN_API_KEY');
    console.error('   Value: <your_postman_api_key>');
    console.error('   (Optional) POSTMAN_COLLECTION_UID = ' + collectionUid);
    console.error('3. For Local CLI Run:');
    console.error('   node scripts/sync-postman.mjs <your_api_key>');
    console.error('   or add POSTMAN_API_KEY=<your_api_key> in your backend/.env\n');
    process.exit(1);
  }

  // Find collection JSON
  const collectionPath = path.resolve(__dirname, '../NISPL_API_Postman_Collection.json');
  if (!fs.existsSync(collectionPath)) {
    console.error('❌ ERROR: Collection JSON not found at:', collectionPath);
    console.error('Run: node generatePostmanCollection.js first.');
    process.exit(1);
  }

  const raw = fs.readFileSync(collectionPath, 'utf-8');
  let collectionJson;
  try {
    collectionJson = JSON.parse(raw);
  } catch (err) {
    console.error('❌ ERROR parsing collection JSON:', err.message);
    process.exit(1);
  }

  const payload = {
    collection: collectionJson
  };

  const url = `https://api.getpostman.com/collections/${collectionUid}`;
  console.log(`📡 Sending PUT request to Postman API: ${url}...`);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log(`\n✅ Postman Collection successfully updated! (HTTP ${status})`);
      console.log('Collection ID:', data?.collection?.id || 'N/A');
      console.log('Collection UID:', data?.collection?.uid || collectionUid);
      console.log('Collection Name:', data?.collection?.name || collectionJson.info?.name);
      console.log('Workspace update completed successfully.');
    } else {
      console.error(`\n❌ Failed to update Postman Collection (HTTP ${status}):`);
      console.error(JSON.stringify(data, null, 2));
      if (status === 401) {
        console.error('\nHint: The provided POSTMAN_API_KEY was rejected by Postman. Please check your key.');
      } else if (status === 404) {
        console.error(`\nHint: Collection with UID "${collectionUid}" was not found. Please verify POSTMAN_COLLECTION_UID.`);
      }
      process.exit(1);
    }
  } catch (fetchErr) {
    console.error('❌ Network or Fetch Error during Postman sync:', fetchErr.message);
    process.exit(1);
  }
}

syncPostman();

