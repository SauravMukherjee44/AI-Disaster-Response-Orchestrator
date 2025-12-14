#!/usr/bin/env node

/**
 * Mock Disaster Data Ingestion Script
 *
 * Loads mock disaster data from JSON files and ingests them into the system
 * through the disaster API endpoint.
 *
 * Usage:
 *   node ingest-data.js [type] [delay]
 *
 * Examples:
 *   node ingest-data.js all 2000          # Ingest all data with 2s delay between records
 *   node ingest-data.js floods 1000       # Ingest only flood data with 1s delay
 *   node ingest-data.js earthquakes 500   # Ingest only earthquake data with 500ms delay
 *   node ingest-data.js social 0          # Ingest social media data with no delay
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('//', '//')}/api/disasters`
  : 'http://localhost:3000/api/disasters';

const DATA_FILES = {
  floods: 'flood-alerts.json',
  earthquakes: 'earthquake-alerts.json',
  social: 'social-media-alerts.json'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ingestDisaster(disaster) {
  try {
    const payload = {
      title: disaster.message.substring(0, 100) + (disaster.message.length > 100 ? '...' : ''),
      description: disaster.message,
      disaster_type: disaster.disaster_type,
      severity: disaster.severity,
      latitude: disaster.location.latitude,
      longitude: disaster.location.longitude,
      affected_population: disaster.affected_population,
      metadata: {
        ...disaster.metadata,
        original_source: disaster.source,
        original_timestamp: disaster.timestamp,
        location_name: disaster.location.name
      }
    };

    console.log(`\n📡 Ingesting: ${disaster.location.name} - ${disaster.disaster_type}`);
    console.log(`   Source: ${disaster.source}`);
    console.log(`   Severity: ${disaster.severity}`);
    console.log(`   Population: ${disaster.affected_population.toLocaleString()}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`   ✅ SUCCESS - Disaster ID: ${data.disaster.id}`);
      console.log(`   🤖 AI Summary generated`);
      console.log(`   🎯 ${data.actions?.length || 0} priority actions created`);
      return { success: true, data };
    } else {
      console.error(`   ❌ FAILED - ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error(`   ❌ ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function loadDataFile(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${filename}: ${error.message}`);
    return [];
  }
}

async function ingestCategory(category, delay = 2000) {
  const filename = DATA_FILES[category];
  if (!filename) {
    console.error(`❌ Unknown category: ${category}`);
    return;
  }

  console.log(`\n🚀 Ingesting ${category} data from ${filename}`);
  console.log(`⏱️  Delay between records: ${delay}ms\n`);

  const disasters = await loadDataFile(filename);

  if (disasters.length === 0) {
    console.log(`⚠️  No data found in ${filename}`);
    return;
  }

  const results = {
    total: disasters.length,
    successful: 0,
    failed: 0
  };

  for (const disaster of disasters) {
    const result = await ingestDisaster(disaster);

    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
    }

    if (delay > 0 && disaster !== disasters[disasters.length - 1]) {
      await sleep(delay);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY for ${category}:`);
  console.log(`   Total records: ${results.total}`);
  console.log(`   ✅ Successful: ${results.successful}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('='.repeat(60) + '\n');

  return results;
}

async function ingestAll(delay = 2000) {
  console.log('\n🌍 INGESTING ALL MOCK DISASTER DATA');
  console.log('='.repeat(60));

  const allResults = {
    total: 0,
    successful: 0,
    failed: 0,
    byCategory: {}
  };

  for (const category of Object.keys(DATA_FILES)) {
    const results = await ingestCategory(category, delay);

    if (results) {
      allResults.total += results.total;
      allResults.successful += results.successful;
      allResults.failed += results.failed;
      allResults.byCategory[category] = results;
    }

    if (delay > 0) {
      console.log(`\n⏸️  Pausing ${delay}ms before next category...\n`);
      await sleep(delay);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 COMPLETE - ALL DATA INGESTED');
  console.log('='.repeat(60));
  console.log(`📊 OVERALL SUMMARY:`);
  console.log(`   Total records: ${allResults.total}`);
  console.log(`   ✅ Successful: ${allResults.successful}`);
  console.log(`   ❌ Failed: ${allResults.failed}`);
  console.log(`   Success rate: ${((allResults.successful / allResults.total) * 100).toFixed(1)}%`);
  console.log('\n📈 By Category:');
  for (const [category, results] of Object.entries(allResults.byCategory)) {
    console.log(`   ${category}: ${results.successful}/${results.total} successful`);
  }
  console.log('='.repeat(60) + '\n');
}

function showUsage() {
  console.log(`
📚 Mock Disaster Data Ingestion Tool

Usage:
  node ingest-data.js [type] [delay]

Arguments:
  type    Data type to ingest: all, floods, earthquakes, social (default: all)
  delay   Delay in milliseconds between records (default: 2000)

Examples:
  node ingest-data.js all 2000          # All data, 2s delay
  node ingest-data.js floods 1000       # Floods only, 1s delay
  node ingest-data.js earthquakes 0     # Earthquakes, no delay
  node ingest-data.js social            # Social media, default delay

Environment:
  NEXT_PUBLIC_SUPABASE_URL   API base URL (defaults to localhost:3000)

Available Data:
  🌊 floods        - 5 flood disaster scenarios
  🏚️  earthquakes  - 6 earthquake scenarios
  📱 social        - 10 social media emergency posts

Total: 21 disaster scenarios ready to ingest
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  const type = args[0] || 'all';
  const delay = parseInt(args[1]) || 2000;

  console.log(`\n🔧 Configuration:`);
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Type: ${type}`);
  console.log(`   Delay: ${delay}ms\n`);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL not set, using localhost:3000');
    console.warn('   Make sure your dev server is running!\n');
  }

  if (type === 'all') {
    await ingestAll(delay);
  } else if (DATA_FILES[type]) {
    await ingestCategory(type, delay);
  } else {
    console.error(`❌ Unknown type: ${type}`);
    console.log(`\nValid types: all, ${Object.keys(DATA_FILES).join(', ')}`);
    console.log(`\nUse --help for more information`);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
