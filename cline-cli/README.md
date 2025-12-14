# Cline CLI Integration

This directory contains Cline CLI scripts for AI-powered disaster analysis and report generation.

## Overview

Cline CLI is integrated into the disaster response system to provide:
- AI-powered situation analysis
- Automated report generation
- Intelligent recommendation systems
- Natural language processing of disaster data

## Scripts

### generate-summary.js

Generates comprehensive AI summaries for disaster events.

**Usage:**
```bash
cd cline-cli
npm install @supabase/supabase-js
node generate-summary.js <disaster_id>
```

**Example:**
```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
node generate-summary.js "550e8400-e29b-41d4-a716-446655440000"
```

**Output:**
```
🤖 Cline CLI: Generating AI summary for disaster 550e8400...

📊 Disaster Details:
   Title: Major Earthquake in San Francisco
   Type: earthquake
   Severity: critical
   Affected: 50,000 people

✅ AI Summary Generated Successfully

📝 Summary:
EARTHQUAKE ALERT: Major Earthquake in San Francisco. This is a CRITICAL
EMERGENCY requiring immediate large-scale response...

💡 Key Insights:
   1. Primary threat: earthquake event classified as critical severity
   2. Geographic impact zone: Centered at [37.7749, -122.4194]
   ...

🎯 Recommendations:
   1. IMMEDIATE: Activate Level 1 emergency response protocol
   2. IMMEDIATE: Deploy all available search and rescue teams
   ...
```

## Integration Points

### 1. Supabase Edge Functions
The Cline CLI logic is also implemented in the `ai-summarize` edge function for serverless execution:
```typescript
const apiUrl = `${supabaseUrl}/functions/v1/ai-summarize`;
await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${anonKey}` },
  body: JSON.stringify({ disaster_id: disasterId })
});
```

### 2. Kestra Workflows
Cline CLI can be triggered from Kestra workflows:
```yaml
- id: generate-summary
  type: io.kestra.plugin.scripts.node.Commands
  commands:
    - node cline-cli/generate-summary.js {{ outputs.disaster_id }}
```

### 3. API Routes
Next.js API routes orchestrate Cline CLI functions:
```typescript
// app/api/disasters/route.ts
const response = await fetch(`${supabaseUrl}/functions/v1/ai-summarize`, {
  method: 'POST',
  body: JSON.stringify({ disaster_id })
});
```

## AI Capabilities

The Cline CLI integration provides:

### 1. Contextual Analysis
- Analyzes disaster type, severity, and scope
- Considers geographic and temporal factors
- Evaluates population impact and resource requirements

### 2. Intelligent Summarization
- Generates executive summaries for rapid decision-making
- Extracts key insights from complex disaster data
- Provides confidence scores for AI-generated content

### 3. Actionable Recommendations
- Prioritizes recommendations based on urgency
- Considers available resources and constraints
- Adapts to evolving disaster situations

### 4. Natural Language Generation
- Creates human-readable reports
- Uses professional emergency management terminology
- Maintains consistent formatting and structure

## Customization

### Adding New Analysis Types

Create new scripts following the pattern:

```javascript
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function analyzeDisaster(disasterId) {
  // Your analysis logic here
}

const disasterId = process.argv[2];
analyzeDisaster(disasterId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
```

### Extending AI Models

To integrate more advanced AI models:

```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateWithGPT(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
  return completion.choices[0].message.content;
}
```

## Testing

Run tests for Cline CLI scripts:

```bash
npm test cline-cli
```

## Monitoring

Track Cline CLI executions in the database:

```sql
SELECT
  model_used,
  confidence_score,
  COUNT(*) as executions,
  AVG(confidence_score) as avg_confidence
FROM ai_summaries
WHERE model_used LIKE 'cline%'
GROUP BY model_used;
```

## Hackathon Demo

For the hackathon presentation:

1. **Show CLI in Action**: Run generate-summary.js live
2. **Explain AI Logic**: Walk through the analysis algorithms
3. **Demonstrate Integration**: Show how Cline connects to Kestra and Oumi RL
4. **Highlight Intelligence**: Emphasize contextual awareness and adaptive recommendations

## Future Enhancements

- Multi-language support for international disasters
- Voice-based report generation
- Real-time streaming analysis
- Integration with external AI APIs (OpenAI, Anthropic)
- Custom training on historical disaster data
