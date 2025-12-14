# Kestra AI Agent Workflow Guide

## Overview

This directory contains advanced Kestra workflows that use **AI Agents** to intelligently analyze disaster data and generate actionable response plans.

## Workflows

### 1. `ai-agent-disaster-workflow.yaml` (Advanced)

**Full-featured AI Agent workflow with comprehensive analysis**

**Features:**
- 🤖 **Dual AI Agent System**
  - Agent 1: Situation analysis and assessment
  - Agent 2: Priority action determination
- 📊 Multi-source data ingestion (files, APIs, webhooks)
- 🎯 Intelligent severity scoring
- 📍 Geographic priority identification
- 💾 Automatic Supabase integration
- 🚨 Critical alert notifications
- 📈 Structured JSON output

**Outputs:**
```json
{
  "analysis_timestamp": "2024-12-14T10:30:00Z",
  "situation_analysis": {
    "severity_level": "critical",
    "severity_score": 92,
    "affected_locations": ["San Francisco", "Oakland", "Berkeley"],
    "primary_hazards": ["Building collapse", "Gas fires"],
    "secondary_risks": ["Aftershocks", "Infrastructure failure"],
    "estimated_affected_population": 3500000,
    "infrastructure_status": {...},
    "summary": "Major earthquake..."
  },
  "priority_actions": {
    "priority_areas": ["Downtown SF", "Oakland Port", "Berkeley Hills"],
    "actions": {
      "rescue": [...],
      "medical": [...],
      "logistics": [...]
    }
  }
}
```

### 2. `simple-ai-workflow.yaml` (Quick Start)

**Simplified workflow for rapid deployment and testing**

**Features:**
- Single-step AI analysis
- Minimal configuration
- Perfect for demos
- Direct Supabase integration

**Use Cases:**
- Quick disaster reporting
- Testing the AI pipeline
- Demonstrations
- Development

### 3. `disaster-ingestion-workflow.yaml` (Original)

**Basic workflow without AI Agents**

Uses external API endpoints for processing.

## Setup Instructions

### Prerequisites

1. **Kestra Installation**
   ```bash
   # Using Docker
   docker run --rm -it -p 8080:8080 \
     -v $(pwd)/kestra:/app/kestra \
     kestra/kestra:latest server local
   ```

2. **Required Secrets in Kestra**

   Navigate to **Settings → Secrets** in Kestra UI:

   - `OPENAI_API_KEY`: Your OpenAI API key (required for AI Agents)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `DASHBOARD_URL`: Your dashboard URL (optional)

### Quick Start

1. **Access Kestra UI**: http://localhost:8080

2. **Create a new Flow**:
   - Click **Flows** → **Create**
   - Copy the contents of `simple-ai-workflow.yaml`
   - Click **Save**

3. **Configure Secrets** (Settings → Secrets):
   ```
   OPENAI_API_KEY: sk-...
   SUPABASE_URL: https://xxx.supabase.co
   SUPABASE_ANON_KEY: eyJ...
   ```

4. **Execute the workflow**:
   ```json
   {
     "disaster_title": "Earthquake in San Francisco",
     "disaster_description": "7.2 magnitude earthquake, multiple casualties",
     "disaster_type": "earthquake",
     "latitude": 37.7749,
     "longitude": -122.4194,
     "affected_population": 50000
   }
   ```

## Sample Data Files

### Using Sample JSON Files

The workflow can ingest pre-formatted disaster data:

**Earthquake Example**: `sample-earthquake-data.json`
- 7.2 magnitude earthquake in SF Bay Area
- 3.5M affected
- Infrastructure damage details

**Flood Example**: `sample-flood-data.json`
- Catastrophic flooding in Houston
- 2.8M affected
- Swift water rescue scenarios

**Usage**:
```yaml
inputs:
  data_source: "file"
  json_file_path: "https://your-server/sample-earthquake-data.json"
```

## AI Agent Workflow Logic

### Phase 1: Situation Analysis

The first AI Agent analyzes raw disaster data to extract:

1. **Severity Assessment**
   - Level: critical/high/medium/low
   - Score: 0-100 quantitative rating

2. **Impact Analysis**
   - Affected locations
   - Population estimates
   - Vulnerable groups

3. **Hazard Identification**
   - Primary hazards (immediate)
   - Secondary risks (follow-on)

4. **Infrastructure Status**
   - Roads, hospitals, utilities
   - Operational capacity

5. **Time Criticality**
   - immediate/urgent/moderate

### Phase 2: Priority Action Determination

The second AI Agent generates specific actions:

1. **RESCUE Operations**
   - Search & rescue priorities
   - Evacuation routes
   - Trapped person locations

2. **MEDICAL Response**
   - Triage requirements
   - Field hospital locations
   - Medical supply needs

3. **LOGISTICS Support**
   - Supply distribution
   - Shelter coordination
   - Transportation routes

Each action includes:
- Specific description
- Priority score (0-100)
- Estimated impact (# people)
- Required resources
- Time sensitivity
- Target locations

### Phase 3: Database Integration

Results are automatically stored in Supabase:

```
disasters table ← Disaster record
    ↓
ai_summaries table ← AI analysis
    ↓
priority_actions table ← Action items (rescue/medical/logistics)
```

## Advanced Usage

### Real-Time API Integration

Connect to live disaster data feeds:

```yaml
inputs:
  data_source: "api"
  api_endpoint: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson"
```

### Webhook Triggers

Receive real-time disaster alerts:

```yaml
triggers:
  - id: webhook-trigger
    type: io.kestra.plugin.core.trigger.Webhook
    key: "disaster-alert-webhook"
```

POST to: `http://kestra:8080/api/v1/executions/webhook/disaster-response/ai-agent-disaster-analysis/disaster-alert-webhook`

### Scheduled Monitoring

Poll disaster data sources automatically:

```yaml
triggers:
  - id: scheduled-monitoring
    type: io.kestra.plugin.core.trigger.Schedule
    cron: "*/15 * * * *"  # Every 15 minutes
```

## Monitoring & Debugging

### View Execution Logs

1. Navigate to **Executions** in Kestra UI
2. Click on execution ID
3. View detailed logs for each task
4. Check AI Agent responses

### Common Issues

**❌ OpenAI API Error**
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota/limits

**❌ Supabase Connection Failed**
- Verify URLs and keys in secrets
- Check Supabase service status

**❌ Invalid JSON from AI**
- AI Agents are temperature-controlled for consistent JSON
- Check model availability

## Example Executions

### Critical Earthquake Response

**Input:**
```json
{
  "disaster_title": "7.2 Magnitude Earthquake - Bay Area",
  "disaster_type": "earthquake",
  "affected_population": 3500000
}
```

**AI Analysis Output:**
- Severity: **CRITICAL** (Score: 92)
- Top Priority: Search & rescue in collapsed buildings
- Medical: Field hospitals for 2500+ injuries
- Logistics: Emergency shelter for 50,000 displaced

### Flood Emergency

**Input:**
```json
{
  "disaster_title": "Catastrophic Flooding - Houston",
  "disaster_type": "flood",
  "affected_population": 2800000
}
```

**AI Analysis Output:**
- Severity: **HIGH** (Score: 88)
- Top Priority: Swift water rescue operations
- Medical: Contamination prevention, disease control
- Logistics: Evacuation routes, shelter coordination

## Integration with Dashboard

The workflow automatically populates your disaster response dashboard:

1. **Disaster created** → Appears in disasters list
2. **AI Summary generated** → Shows in AI Analysis panel
3. **Priority actions created** → Appears in Actions tab
4. **RL scores calculated** → Actions are prioritized

View results at: `http://localhost:3000`

## Best Practices

### 1. Data Quality
- Provide detailed disaster descriptions
- Include accurate coordinates
- Specify affected population ranges

### 2. AI Prompts
- Keep system prompts focused and specific
- Request structured JSON output
- Use low temperature (0.3) for consistency

### 3. Error Handling
- Implement retry logic for API calls
- Validate JSON before database insertion
- Log all AI responses for audit

### 4. Performance
- Use `gpt-4o-mini` for cost efficiency
- Cache frequent analyses
- Batch database operations

## Cost Considerations

**OpenAI API Usage:**
- ~$0.15 per disaster analysis (GPT-4o-mini)
- 2 AI Agent calls per execution
- ~1,000 tokens per analysis

**Optimization Tips:**
- Use simpler models for testing
- Implement caching for similar disasters
- Batch multiple disasters when possible

## Future Enhancements

- [ ] Multi-language support
- [ ] Image analysis from satellite/drone feeds
- [ ] Social media sentiment analysis
- [ ] Predictive modeling for cascading disasters
- [ ] Resource optimization with RL agents
- [ ] Real-time collaboration features

## Support

For issues or questions:
1. Check Kestra logs in UI
2. Review Supabase function logs
3. Verify AI Agent responses
4. Check sample data format

## License

MIT License - See main project README
