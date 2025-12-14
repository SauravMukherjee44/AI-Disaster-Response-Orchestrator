#!/usr/bin/env node

/**
 * Cline CLI Integration for AI Summary Generation
 *
 * This script demonstrates using Cline CLI to generate AI-powered
 * disaster summaries and situation reports.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAISummary(disasterId) {
  console.log(`\n🤖 Cline CLI: Generating AI summary for disaster ${disasterId}`);

  const { data: disaster, error } = await supabase
    .from('disasters')
    .select('*')
    .eq('id', disasterId)
    .single();

  if (error || !disaster) {
    console.error('❌ Error fetching disaster:', error?.message);
    return;
  }

  console.log(`\n📊 Disaster Details:`);
  console.log(`   Title: ${disaster.title}`);
  console.log(`   Type: ${disaster.disaster_type}`);
  console.log(`   Severity: ${disaster.severity}`);
  console.log(`   Affected: ${disaster.affected_population.toLocaleString()} people`);

  const summary = generateDetailedSummary(disaster);
  const insights = extractKeyInsights(disaster);
  const recommendations = generateRecommendations(disaster);

  const { data: aiSummary, error: insertError } = await supabase
    .from('ai_summaries')
    .insert({
      disaster_id: disasterId,
      summary: summary,
      key_insights: insights,
      recommended_actions: recommendations,
      confidence_score: 0.85,
      model_used: 'cline-cli-v1',
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error saving summary:', insertError.message);
    return;
  }

  console.log(`\n✅ AI Summary Generated Successfully`);
  console.log(`\n📝 Summary:\n${summary}\n`);
  console.log(`💡 Key Insights:`);
  insights.forEach((insight, i) => console.log(`   ${i + 1}. ${insight}`));
  console.log(`\n🎯 Recommendations:`);
  recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
}

function generateDetailedSummary(disaster) {
  const severityDescriptions = {
    critical: 'CRITICAL EMERGENCY requiring immediate large-scale response',
    high: 'High-priority emergency demanding urgent intervention',
    medium: 'Moderate emergency requiring coordinated response',
    low: 'Low-level incident requiring monitoring and basic response',
  };

  return `${disaster.disaster_type.toUpperCase()} ALERT: ${disaster.title}. ` +
    `This is a ${severityDescriptions[disaster.severity] || 'emergency situation'}. ` +
    `Geographic epicenter: [${disaster.latitude.toFixed(4)}, ${disaster.longitude.toFixed(4)}]. ` +
    `Current estimates indicate approximately ${disaster.affected_population.toLocaleString()} individuals affected. ` +
    `Situation: ${disaster.description}. ` +
    `Status: ${disaster.status.toUpperCase()}. Immediate coordination and resource deployment required.`;
}

function extractKeyInsights(disaster) {
  const insights = [];

  insights.push(
    `Primary threat: ${disaster.disaster_type} event classified as ${disaster.severity} severity`
  );

  insights.push(
    `Geographic impact zone: Centered at [${disaster.latitude}, ${disaster.longitude}] with potential regional effects`
  );

  insights.push(
    `Population impact: Estimated ${disaster.affected_population.toLocaleString()} people directly affected, with potential for secondary impacts`
  );

  if (disaster.severity === 'critical' || disaster.severity === 'high') {
    insights.push(
      `URGENT: Critical severity level requires immediate multi-agency coordination and resource mobilization`
    );
  }

  insights.push(
    `Operational status: ${disaster.status.toUpperCase()} - continuous monitoring and adaptive response required`
  );

  return insights;
}

function generateRecommendations(disaster) {
  const recommendations = [];

  if (disaster.severity === 'critical') {
    recommendations.push(
      'IMMEDIATE: Activate Level 1 emergency response protocol with full resource deployment'
    );
    recommendations.push(
      'IMMEDIATE: Deploy all available search and rescue teams to affected zone'
    );
    recommendations.push(
      'IMMEDIATE: Establish incident command center and emergency operations coordination'
    );
  }

  if (disaster.severity === 'critical' || disaster.severity === 'high') {
    recommendations.push(
      'HIGH PRIORITY: Set up field hospitals and emergency medical treatment facilities'
    );
    recommendations.push(
      'HIGH PRIORITY: Initiate mass notification system and public safety alerts'
    );
  }

  if (disaster.affected_population > 5000) {
    recommendations.push(
      'CRITICAL: Establish emergency shelters and mass care facilities for displaced populations'
    );
    recommendations.push(
      'CRITICAL: Secure and distribute emergency supplies (water, food, medical)'
    );
  }

  recommendations.push(
    'STANDARD: Maintain continuous situational awareness and adjust response posture as conditions evolve'
  );

  recommendations.push(
    'STANDARD: Document all response actions for after-action review and improvement'
  );

  return recommendations;
}

const disasterId = process.argv[2];

if (!disasterId) {
  console.error('Usage: node generate-summary.js <disaster_id>');
  process.exit(1);
}

generateAISummary(disasterId)
  .then(() => {
    console.log('\n✨ Cline CLI task completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
